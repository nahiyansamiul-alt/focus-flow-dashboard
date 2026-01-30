import { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        on: (channel: string, listener: (...args: any[]) => void) => void;
        removeListener: (channel: string, listener: (...args: any[]) => void) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
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

    // Listen for update events from main process
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.on('update-available', handleUpdateAvailable);
      window.electron.ipcRenderer.on('update-downloaded', handleUpdateDownloaded);

      return () => {
        window.electron.ipcRenderer.removeListener('update-available', handleUpdateAvailable);
        window.electron.ipcRenderer.removeListener('update-downloaded', handleUpdateDownloaded);
      };
    }
  }, []);

  const handleInstallUpdate = async () => {
    if (window.electron?.ipcRenderer) {
      await window.electron.ipcRenderer.invoke('install-update');
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
