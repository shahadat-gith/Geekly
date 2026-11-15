import { Alert } from './Alert.jsx';
import { Button } from './Button.jsx';
import { Modal } from './Modal.jsx';

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  busy = false,
  error = '',
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} disabled={busy}>
            <i
              aria-hidden="true"
              className={`bx ${busy ? 'bx-loader-alt animate-admin-spin' : 'bx-trash'} text-[16px]`}
            />
            {busy ? 'Deleting…' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
          <i aria-hidden="true" className="bx bx-trash text-[20px]" />
        </span>
        <div className="min-w-0">
          <p className="m-0 text-[13.5px] leading-relaxed text-text-secondary">{description}</p>
          {error && <Alert className="mt-3">{error}</Alert>}
        </div>
      </div>
    </Modal>
  );
}
