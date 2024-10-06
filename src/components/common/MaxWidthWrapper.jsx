import {cn} from "@/lib/utils";

function MaxWidthWrapper({className, children}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-screen-xl px-3 md:px-20", className)}
    >
      {children}
    </div>
  );
}

export default MaxWidthWrapper;
