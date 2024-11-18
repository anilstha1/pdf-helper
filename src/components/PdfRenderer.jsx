"use client";

import {Loader2} from "lucide-react";
import {useState, useEffect} from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import PdfFullscreen from "./PdfFullscreen";

const PdfRenderer = ({url}) => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPdfUrl(url);
    setLoading(false);
  }, [url]);

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-end px-2">
        <PdfFullscreen fileUrl={url} />
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10.5rem)]">
          <div>
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="my-24 h-6 w-6 animate-spin" />
              </div>
            ) : (
              <iframe src={pdfUrl} className="w-full h-[calc(100vh-10.5rem)]" />
            )}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
