import { cn } from "@/lib/utils";

const GUTLY_LOGO_SRC = "/lovable-uploads/98b6daca-32d4-4d0a-aa72-75a1d85b5a10.png";

export default function GutlyLogoMark({
  className,
  title = "Gutly",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <img
      src={GUTLY_LOGO_SRC}
      alt={title}
      className={cn(
        "size-11 shrink-0 rounded-[14px] object-cover object-center",
        className,
      )}
    />
  );
}
