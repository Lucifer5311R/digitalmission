import React, { useEffect, useState } from 'react';
import { Star, Clock, Calendar } from 'lucide-react';
import { assignmentsApi, trainersApi, ratingsApi } from '../../services/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { StarRating } from '../common/StarRating';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { User, TrainerStats } from '../../types';

export function TrainersTab() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [trainerStats, setTrainerStats] = useState<TrainerStats | null>(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [ratingTrainer, setRatingTrainer] = useState<{ id: string; name: string } | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      const res = await assignmentsApi.getAll();
      const assignments = res.data.data || [];
      // Get unique trainers
      const trainerMap = new Map<string, any>();
      for (const a of assignments) {
        if (a.trainer && !trainerMap.has(a.trainer.id)) {
          trainerMap.set(a.trainer.id, a.trainer);
        }
      }
      const uniqueTrainers = Array.from(trainerMap.values());

      // Load stats for each
      const withStats = await Promise.all(
        uniqueTrainers.map(async (t) => {
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
      loadTrainers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Trainers</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trainers.map(trainer => (
          <Card key={trainer.id}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{trainer.name}</h3>
                <p className="text-sm text-gray-500">{trainer.email}</p>
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

            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => {
                setRatingTrainer({ id: trainer.id, name: trainer.name });
                setRateModalOpen(true);
              }}
            >
              <Star className="w-4 h-4 mr-1" />
              Rate Trainer
            </Button>
          </Card>
        ))}
      </div>

      {trainers.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-500">No trainers found. Assign trainers to classes first.</p>
        </Card>
      )}

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
