import {auth} from "@/auth";
import ChatWrapper from "@/components/ChatWrapper";
import PdfRenderer from "@/components/PdfRenderer";
import {prisma} from "@/lib/db";
import {notFound} from "next/navigation";

const Page = async ({params}) => {
  const {id} = params;

  const session = await auth();

  const file = await prisma.file.findUnique({
    where: {
      id: id,
      userId: session.user.id,
    },
  });
  console.log(file);
  if (!file) notFound();

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left sidebar & main wrapper */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            {/* Main area */}
            <PdfRenderer url={file.url} />
          </div>
        </div>

        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper isSubscribed={true} fileId={file.id} />
        </div>
      </div>
    </div>
  );
};

export default Page;
