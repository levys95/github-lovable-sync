
import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface FileUploaderProps {
  files: string[];
  onFilesChange: (urls: string[]) => void;
  bucket?: string;
  label?: string;
  maxFiles?: number;
}

const randomName = (original: string) => {
  const ext = original.split('.').pop();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}${ext ? '.' + ext : ''}`;
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  onFilesChange,
  bucket = 'inventory-files',
  label = 'Fichiers',
  maxFiles = 10,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const remaining = Math.max(0, maxFiles - files.length);
    const toUpload = Array.from(selected).slice(0, remaining);

    const uploads = await Promise.all(
      toUpload.map(async (file) => {
        const name = randomName(file.name);
        const { data, error } = await supabase.storage.from(bucket).upload(name, file, {
          contentType: file.type || undefined,
          upsert: false,
        });
        if (error) {
          console.error('File upload error:', error);
          toast({ title: 'Upload échoué', description: error.message, variant: 'destructive' });
          return null;
        }
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
        return pub.publicUrl;
      })
    );

    const newUrls = uploads.filter(Boolean) as string[];
    if (newUrls.length) {
      onFilesChange([...files, ...newUrls]);
      toast({ title: 'Upload réussi', description: `${newUrls.length} fichier(s) ajouté(s)` });
    }
    e.target.value = '';
  };

  const remove = (i: number) => {
    const next = files.filter((_, idx) => idx !== i);
    onFilesChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label} ({files.length}/{maxFiles})</span>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
      </div>
      <input ref={inputRef} type="file" multiple onChange={handleUpload} className="hidden" />

      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((u, i) => (
            <li key={u} className="flex items-center justify-between rounded border p-2">
              <a href={u} target="_blank" rel="noreferrer" className="text-sm truncate underline">
                {u}
              </a>
              <Button type="button" variant="destructive" size="sm" onClick={() => remove(i)}>
                Supprimer
              </Button>
            </li>
          ))}
        </ul>
      )}
      {files.length === 0 && (
        <div className="text-xs text-muted-foreground">Aucun fichier</div>
      )}
    </div>
  );
};
