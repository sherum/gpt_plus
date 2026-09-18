// Chromium File System Access API members missing from lib.dom.
interface FileSystemPermissionDescriptor {
  mode: 'read' | 'readwrite';
}

interface FileSystemHandle {
  queryPermission(descriptor?: FileSystemPermissionDescriptor): Promise<PermissionState>;
  requestPermission(descriptor?: FileSystemPermissionDescriptor): Promise<PermissionState>;
}

interface Window {
  showDirectoryPicker(options?: FileSystemPermissionDescriptor): Promise<FileSystemDirectoryHandle>;
}
