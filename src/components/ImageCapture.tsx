import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

interface ImageCaptureProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  allowVideo?: boolean;
}

export const ImageCapture = ({ images, onImagesChange, maxImages = 5, allowVideo = true }: ImageCaptureProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNativeMobile, setIsNativeMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('ImageCapture component loaded successfully');
    // Detect mobile devices and native environment
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isNative = Capacitor.isNativePlatform();
      
      setIsMobile(isMobileDevice || isIOS);
      setIsNativeMobile(isNative);
    };
    
    checkMobile();
  }, []);

  const startCamera = async () => {
    if (isNativeMobile) {
      await takeNativePhoto();
      return;
    }

    // On mobile devices, especially iOS, prefer the file input method
    if (isMobile) {
      handleCameraInput();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to camera input for mobile devices
      handleCameraInput();
    }
  };

  const optimizeImage = async (file: File | Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1280px width/height)
        const MAX_DIMENSION = 1280;
        let { width, height } = img;
        
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = (height * MAX_DIMENSION) / width;
            width = MAX_DIMENSION;
          } else {
            width = (width * MAX_DIMENSION) / height;
            height = MAX_DIMENSION;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (ctx) {
          // Draw and compress the image
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.8);
        }
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImageToStorage = async (file: File | Blob): Promise<string | null> => {
    try {
      // Optimize image before upload
      const optimizedImage = await optimizeImage(file);
      
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { data, error } = await supabase.storage
        .from('inventory-images')
        .upload(fileName, optimizedImage, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('inventory-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const takeNativePhoto = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1280,
        height: 720
      });

      if (image.dataUrl) {
        const blob = dataURLtoBlob(image.dataUrl);
        const imageUrl = await uploadImageToStorage(blob);
        if (imageUrl) {
          const newImages = [...images, imageUrl];
          onImagesChange(newImages);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const recordNativeVideo = async () => {
    try {
      // For now, use the web video input as native video recording
      // requires more complex setup with media recorder
      handleVideoInput();
    } catch (error) {
      console.error('Error recording video:', error);
    }
  };

  const handleCameraInput = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleVideoInput = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const imageUrl = await uploadImageToStorage(blob);
            if (imageUrl) {
              const newImages = [...images, imageUrl];
              onImagesChange(newImages);
              
              if (newImages.length >= maxImages) {
                stopCamera();
              }
            }
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const uploadPromises = [];
      for (const file of Array.from(files)) {
        if (images.length + uploadPromises.length < maxImages) {
          if (file.type.startsWith('image/')) {
            uploadPromises.push(uploadImageToStorage(file));
          } else if (file.type.startsWith('video/')) {
            // For videos, still use data URL for now
            uploadPromises.push(new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve(e.target?.result as string);
              };
              reader.readAsDataURL(file);
            }));
          }
        }
      }
      
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null);
      if (validUrls.length > 0) {
        const newImages = [...images, ...validUrls];
        onImagesChange(newImages);
      }
    }
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        if (images.length < maxImages) {
          // For videos, still use data URL for now
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              const newImages = [...images, e.target.result as string];
              onImagesChange(newImages);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-700">Photos & Vidéos ({images.length}/{maxImages})</h3>
        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startCamera}
            disabled={isCapturing || images.length >= maxImages}
          >
            <Camera className="h-4 w-4 mr-1" />
            Photo
          </Button>
          {allowVideo && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={isNativeMobile ? recordNativeVideo : handleVideoInput}
              disabled={isCapturing || images.length >= maxImages}
            >
              <Video className="h-4 w-4 mr-1" />
              Vidéo
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= maxImages}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
        </div>
      </div>

      {/* Regular file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera input for mobile devices - opens camera directly */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Video input for mobile devices - opens video recorder */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {isCapturing && !isMobile && (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded-lg bg-black"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button onClick={capturePhoto} size="sm">
                  <Camera className="h-4 w-4 mr-1" />
                  Capture
                </Button>
                <Button onClick={stopCamera} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              {image.startsWith('data:video/') ? (
                <video
                  src={image}
                  controls
                  className="w-full h-32 object-cover rounded-lg border"
                />
              ) : (
                <img
                  src={image}
                  alt={`Media ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Aucune photo ou vidéo ajoutée</p>
          <p className="text-xs text-gray-400">
            {isNativeMobile 
              ? 'Utilisez les boutons Photo et Vidéo pour capturer du contenu' 
              : isMobile 
              ? 'Appuyez sur les boutons pour prendre des photos ou vidéos' 
              : 'Utilisez la caméra ou téléchargez des fichiers'
            }
          </p>
        </div>
      )}
    </div>
  );
};