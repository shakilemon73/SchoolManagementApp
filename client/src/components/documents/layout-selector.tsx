import { Label } from '@/components/ui/label';

type LayoutType = '1' | '2' | '4' | '9';

interface LayoutSelectorProps {
  layout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export function LayoutSelector({ layout, onLayoutChange }: LayoutSelectorProps) {
  
  const layouts = [
    { id: '1', label: "কন্টেন্ট" },
    { id: '2', label: "কন্টেন্ট" },
    { id: '4', label: "কন্টেন্ট" },
    { id: '9', label: "কন্টেন্ট" }
  ];

  return (
    <div className="mb-6">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        "layout.title"
      </Label>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {layouts.map((l) => (
          <div className="relative" key={l.id}>
            <input 
              type="radio" 
              id={`layout${l.id}`} 
              name="layout" 
              className="sr-only"
              checked={layout === l.id as LayoutType}
              onChange={() => onLayoutChange(l.id as LayoutType)}
            />
            <label 
              htmlFor={`layout${l.id}`} 
              className={`block p-2 border-2 rounded-md cursor-pointer ${
                layout === l.id as LayoutType 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="aspect-[210/297] w-full bg-white border border-gray-200">
                {l.id === '1' && (
                  <div className="w-full h-full p-1 border border-gray-300 rounded-sm"></div>
                )}
                {l.id === '2' && (
                  <div className="grid grid-cols-2 gap-1 p-1 h-full">
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                  </div>
                )}
                {l.id === '4' && (
                  <div className="grid grid-cols-2 grid-rows-2 gap-1 p-1 h-full">
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                  </div>
                )}
                {l.id === '9' && (
                  <div className="grid grid-cols-3 grid-rows-3 gap-1 p-1 h-full">
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                    <div className="border border-gray-300 rounded-sm"></div>
                  </div>
                )}
              </div>
              <span 
                className={`block text-center text-sm mt-2 ${
                  layout === l.id as LayoutType 
                    ? 'text-primary font-medium' 
                    : 'text-gray-700'
                }`}
              >
                {l.label}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
