import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Users, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { classesApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ClassItem } from '../../types';

const ClassCard = React.memo(function ClassCard({ cls, onEdit, onDelete, onNavigate }: {
  cls: ClassItem;
  onEdit: (cls: ClassItem) => void;
  onDelete: (id: string) => void;
  onNavigate: (id: string) => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold cursor-pointer text-primary-600 hover:text-primary-700" onClick={() => onNavigate(cls.id)}>
          {cls.name}
        </h3>
        <Badge variant={cls.status === 'active' ? 'success' : cls.status === 'archived' ? 'gray' : 'warning'}>
          {cls.status}
        </Badge>
      </div>
      {cls.description && <p className="text-sm text-gray-600 mb-3">{cls.description}</p>}
      <div className="space-y-1 text-sm text-gray-500 mb-4">
        {cls.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> {cls.location}
          </div>
        )}
        {cls.capacity && (
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Capacity: {cls.capacity}
          </div>
        )}
        {cls.teacher_name && (
          <div className="flex items-center gap-1.5">
            <UserIcon className="w-4 h-4" /> Teacher: {cls.teacher_name}
          </div>
        )}
        {cls.cr_name && (
          <div className="flex items-center gap-1.5">
            <UserIcon className="w-4 h-4" /> CR: {cls.cr_name}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => onEdit(cls)}>
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(cls.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
});

export function ClassesTab() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', location: '', capacity: '', teacher_name: '', teacher_contact: '', cr_name: '', cr_contact: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try {
      const res = await classesApi.getAll();
      setClasses(res.data.data || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', description: '', location: '', capacity: '', teacher_name: '', teacher_contact: '', cr_name: '', cr_contact: '' });
    setModalOpen(true);
  };

  const openEdit = (cls: ClassItem) => {
    setEditing(cls);
    setFormData({
      name: cls.name,
      description: cls.description || '',
      location: cls.location || '',
      capacity: cls.capacity?.toString() || '',
      teacher_name: cls.teacher_name || '',
      teacher_contact: cls.teacher_contact || '',
      cr_name: cls.cr_name || '',
      cr_contact: cls.cr_contact || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    setSubmitting(true);
    try {
      const data: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        teacher_name: formData.teacher_name.trim() || undefined,
        teacher_contact: formData.teacher_contact.trim() || undefined,
        cr_name: formData.cr_name.trim() || undefined,
        cr_contact: formData.cr_contact.trim() || undefined,
      };
      if (editing) {
        await classesApi.update(editing.id, data);
      } else {
        await classesApi.create(data);
      }
      setModalOpen(false);
      loadClasses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this class?')) return;
    try {
      await classesApi.delete(id);
      loadClasses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Class
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map(cls => (
          <ClassCard key={cls.id} cls={cls} onEdit={openEdit} onDelete={handleDelete} onNavigate={(id) => navigate(`/supervisor/classes/${id}`)} />
        ))}
      </div>

      {classes.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-500">No classes yet. Create your first class!</p>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Class' : 'New Class'}>
        <div className="space-y-4">
          <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Class name" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[80px] resize-y"
              placeholder="Class description"
            />
          </div>
          <Input label="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Room or location" />
          <Input label="Capacity" type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} placeholder="Max participants" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Class Teacher" value={formData.teacher_name} onChange={e => setFormData({ ...formData, teacher_name: e.target.value })} placeholder="Teacher name" />
            <Input label="Teacher Contact" value={formData.teacher_contact} onChange={e => setFormData({ ...formData, teacher_contact: e.target.value })} placeholder="Phone number" />
            <Input label="CR Name" value={formData.cr_name} onChange={e => setFormData({ ...formData, cr_name: e.target.value })} placeholder="Class representative" />
            <Input label="CR Contact" value={formData.cr_contact} onChange={e => setFormData({ ...formData, cr_contact: e.target.value })} placeholder="Phone number" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} isLoading={submitting} disabled={!formData.name.trim()}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
