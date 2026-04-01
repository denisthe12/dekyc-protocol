'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  StyledDialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loadEnergySession } from '@/lib/session';
import {
  fetchActionPasswordStatus,
  verifyActionPassword,
} from '@/lib/api/settings';

export function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm action',
  description = 'Enter your action password to continue.',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
}) {
  const [password, setPasswordValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const [passwordIsSet, setPasswordIsSet] = useState(false);

  useEffect(() => {
    if (!open) {
      setPasswordValue('');
      setError(null);
      setSubmitting(false);
      setStatusChecked(false);
      setPasswordIsSet(false);
      return;
    }

    void loadStatus();
  }, [open]);

  async function loadStatus(): Promise<void> {
    try {
      const session = loadEnergySession();
      if (!session) {
        throw new Error('Energy session not found');
      }

      const status = await fetchActionPasswordStatus(session.accessToken);
      setPasswordIsSet(status.isSet);
      setStatusChecked(true);

      if (!status.isSet) {
        setError('Action password is not set. Please configure it in Settings.');
      }
    } catch (err) {
      setStatusChecked(true);
      setError(err instanceof Error ? err.message : 'Failed to load password status');
    }
  }

  async function handleConfirm(): Promise<void> {
    try {
      setError(null);

      const session = loadEnergySession();
      if (!session) {
        throw new Error('Energy session not found');
      }

      if (!passwordIsSet) {
        throw new Error('Action password is not set. Please configure it in Settings.');
      }

      if (!password) {
        throw new Error('Enter action password');
      }

      setSubmitting(true);

      await verifyActionPassword({
        accessToken: session.accessToken,
        password,
      });

      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action confirmation failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <StyledDialogContent>
        <div className="space-y-4">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            {description}
          </DialogDescription>

          {!statusChecked ? (
            <div className="text-sm text-zinc-400">Loading...</div>
          ) : (
            <>
              <Input
                type="password"
                placeholder="Enter action password"
                value={password}
                onChange={(event) => setPasswordValue(event.target.value)}
                disabled={!passwordIsSet || submitting}
              />

              {error ? (
                <div className="text-sm text-red-500">{error}</div>
              ) : null}

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => void handleConfirm()}
                  disabled={submitting || !passwordIsSet}
                >
                  {submitting ? 'Confirming...' : 'Confirm'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </StyledDialogContent>
    </Dialog>
  );
}