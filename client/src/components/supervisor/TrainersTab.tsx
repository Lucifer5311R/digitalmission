import React, { useEffect, useState } from 'react';
import { Star, Clock, Calendar, Plus, Trash2 } from 'lucide-react';
import { trainersApi, ratingsApi, usersApi } from '../../services/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { StarRating } from '../common/StarRating';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { TrainerStats } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const TrainerCard = React.memo(function TrainerCard({ trainer, onRate, onDelete }: {
  trainer: any;
  onRate: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{trainer.name}</h3>
          <p className="text-sm text-gray-500">{trainer.email}</p>
          {trainer.phone && <p className="text-sm text-gray-500">{trainer.phone}</p>}
        </div>
        <Badge variant="success">Active</Badge>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{trainer.stats?.totalHours || 0} hours total</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{trainer.stats?.totalSessions || 0} sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          <span>
            {trainer.stats?.averageRating
              ? `${trainer.stats.averageRating.toFixed(1)} / 5.0`
              : 'No ratings yet'}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onRate(trainer.id, trainer.name)}
        >
          <Star className="w-4 h-4 mr-1" />
          Rate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(trainer.id, trainer.name)}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </Card>
  );
});

export function TrainersTab() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [ratingTrainer, setRatingTrainer] = useState<{ id: string; name: string } | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  // Add trainer modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      const res = await usersApi.getByRole('trainer');
      const allTrainers = res.data.data || [];

      // Load stats for each trainer
      const withStats = await Promise.all(
        allTrainers.map(async (t: any) => {
          try {
            const statsRes = await trainersApi.getStats(t.id);
            return { ...t, stats: statsRes.data.data?.stats };
          } catch {
            return { ...t, stats: null };
          }
        })
      );
      setTrainers(withStats);
    } catch (err) {
      console.error('Failed to load trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainer = async () => {
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password) return;
    setAdding(true);
    try {
      await usersApi.createTrainer({
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        password: addForm.password,
        phone: addForm.phone.trim() || undefined,
      });
      setAddModalOpen(false);
      setAddForm({ name: '', email: '', password: '', phone: '' });
      addToast('Trainer added successfully', 'success');
      loadTrainers();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to add trainer', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete trainer "${name}"? This cannot be undone.`)) return;
    try {
      await usersApi.delete(id);
      addToast('Trainer deleted', 'success');
      loadTrainers();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to delete trainer', 'error');
    }
  };

  const handleRate = async () => {
    if (!ratingTrainer || newRating === 0) return;
    setSubmitting(true);
    try {
      await ratingsApi.create({
        trainer_id: ratingTrainer.id,
        rating: newRating,
        feedback_text: feedback || undefined,
      });
      setRateModalOpen(false);
      setNewRating(0);
      setFeedback('');
      addToast('Rating submitted', 'success');
      loadTrainers();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to submit rating', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Trainers</h1>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Trainer
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trainers.map(trainer => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
            onRate={(id, name) => {
              setRatingTrainer({ id, name });
              setRateModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {trainers.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-500">No trainers yet. Add your first trainer!</p>
        </Card>
      )}

      {/* Add Trainer Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Trainer">
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={addForm.name}
            onChange={e => setAddForm({ ...addForm, name: e.target.value })}
            placeholder="Trainer's full name"
          />
          <Input
            label="Email"
            type="email"
            value={addForm.email}
            onChange={e => setAddForm({ ...addForm, email: e.target.value })}
            placeholder="trainer@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={addForm.password}
            onChange={e => setAddForm({ ...addForm, password: e.target.value })}
            placeholder="Minimum 6 characters"
          />
          <Input
            label="Phone (optional)"
            value={addForm.phone}
            onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
            placeholder="Phone number"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddTrainer}
              isLoading={adding}
              disabled={!addForm.name.trim() || !addForm.email.trim() || addForm.password.length < 6}
            >
              Add Trainer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rate Modal */}
      <Modal
        isOpen={rateModalOpen}
        onClose={() => { setRateModalOpen(false); setNewRating(0); setFeedback(''); }}
        title={`Rate ${ratingTrainer?.name || 'Trainer'}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <StarRating rating={newRating} interactive onChange={setNewRating} size="lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback (optional)</label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="input-field min-h-[100px] resize-y"
              placeholder="Share your feedback about this trainer..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setRateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRate} isLoading={submitting} disabled={newRating === 0}>Submit Rating</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


