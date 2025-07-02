
import { Badge } from '@/components/ui/badge';
import { getMetalContent, MetalContent } from '@/utils/metalData';

interface MetalContentProps {
  category: string;
  className?: string;
}

export const MetalContentDisplay = ({ category, className = '' }: MetalContentProps) => {
  const metalContent = getMetalContent(category);
  
  if (!metalContent) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      <Badge variant="outline" className="text-xs bg-gray-100">
        Ag: {metalContent.Ag} ppm
      </Badge>
      <Badge variant="outline" className="text-xs bg-yellow-100">
        Au: {metalContent.Au} ppm
      </Badge>
      <Badge variant="outline" className="text-xs bg-blue-100">
        Pd: {metalContent.Pd} ppm
      </Badge>
      <Badge variant="outline" className="text-xs bg-orange-100">
        Cu: {metalContent.Cu}%
      </Badge>
    </div>
  );
};
