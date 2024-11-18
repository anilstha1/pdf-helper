import {useState} from "react";
import {Dialog, DialogContent, DialogTrigger} from "./ui/dialog";
import {Button} from "./ui/button";
import {Expand} from "lucide-react";

const PdfFullscreen = ({fileUrl}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        if (!value) {
          setIsOpen(value);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button variant="ghost" className="gap-1.5" aria-label="fullscreen">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <div className="max-h-[calc(100vh-10rem)] mt-6">
          <iframe src={fileUrl} className="w-full h-[calc(100vh-10rem)]" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullscreen;
