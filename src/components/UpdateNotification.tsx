import { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

type UpdateInfo = {
  version: string | null;
};

type UpdateActionResult = {
  ok: boolean;
  status: string;
  message?: string;
};

declare global {
  interface Window {
    electron?: {
      updates: {
        check: () => Promise<UpdateActionResult>;
        install: () => Promise<UpdateActionResult>;
        onAvailable: (listener: (info: UpdateInfo) => void) => () => void;
        onDownloaded: (listener: (info: UpdateInfo) => void) => () => void;
        onError: (listener: (error: { message: string }) => void) => () => void;
      };
      getApiUrl: () => Promise<string>;
      getVersion: () => Promise<string>;
      platform: string;
      isElectron: boolean;
    };
  }
}

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    const handleUpdateDownloaded = () => {
      setUpdateDownloaded(true);
      setUpdateAvailable(false);
    };

    const updates = window.electron?.updates;
    if (!updates) return;

    const removeAvailableListener = updates.onAvailable(handleUpdateAvailable);
    const removeDownloadedListener = updates.onDownloaded(handleUpdateDownloaded);
    const removeErrorListener = updates.onError(({ message }) => {
      console.error('Update error:', message);
    });

    // Subscribe first so fast update responses cannot race the renderer.
    void updates
      .check()
      .then((result) => {
        if (!result.ok && result.status === 'error') {
          console.error('Update check failed:', result.message);
        }
      })
      .catch((error) => {
        console.error('Update check IPC failed:', error);
      });

    return () => {
      removeAvailableListener();
      removeDownloadedListener();
      removeErrorListener();
    };
  }, []);

  const handleInstallUpdate = async () => {
    if (window.electron?.updates) {
      try {
        const result = await window.electron.updates.install();
        if (!result.ok) {
          console.error('Update installation could not start:', result.status);
        }
      } catch (error) {
        console.error('Update installation IPC failed:', error);
      }
    }
  };

  return (
    <>
      {/* Update available notification */}
      <AlertDialog open={updateAvailable} onOpenChange={setUpdateAvailable}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Available</AlertDialogTitle>
            <AlertDialogDescription>
              A new version of FocusFlow is available. The update is being downloaded. You'll be notified when it's ready to install.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Later</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update ready to install notification */}
      <AlertDialog open={updateDownloaded} onOpenChange={setUpdateDownloaded}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Ready to Install</AlertDialogTitle>
            <AlertDialogDescription>
              The update has been downloaded and is ready to install. The app will restart to apply the update.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleInstallUpdate}>
              Install Now
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
