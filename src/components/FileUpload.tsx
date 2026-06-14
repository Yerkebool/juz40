import { useRef, useState } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import type { Attachment } from '../types';

interface FileUploadProps {
  files: Attachment[];
  onAdd: (file: Attachment) => void;
  onRemove: (id: string) => void;
  onError?: (msg: string) => void;
}

export function FileUpload({ files, onAdd, onRemove, onError }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  function getKind(name: string): 'pdf' | 'image' | 'other' {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    return 'other';
  }

  function getIcon(kind: 'pdf' | 'image' | 'other') {
    if (kind === 'pdf') return <FileText size={16} className="text-red-400" />;
    if (kind === 'image') return <Image size={16} className="text-blue-400" />;
    return <File size={16} className="text-gray-400" />;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 10) {
      onError?.('Файл 10 МБ-тан артық болмауы керек');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setUploading(true);
    setProgress(0);

    // Simulate upload with progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 30 + 10;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        const attachment: Attachment = {
          id: `upload-${Date.now()}`,
          name: file.name,
          sizeMb: Math.round(sizeMb * 10) / 10,
          kind: getKind(file.name),
        };
        onAdd(attachment);
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 300);
      }
      setProgress(p);
    }, 200);

    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="*/*"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#2F80ED] hover:text-[#2F80ED] transition-colors disabled:opacity-50"
      >
        <Upload size={18} />
        <span className="text-sm">Добавить файл</span>
      </button>

      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Загрузка...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-full bg-[#2F80ED] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100"
            >
              {getIcon(f.kind)}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{f.name}</p>
                <p className="text-[10px] text-gray-400">{f.sizeMb} МБ</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(f.id)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={14} className="text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">не более 10 МБ</p>
    </div>
  );
}
