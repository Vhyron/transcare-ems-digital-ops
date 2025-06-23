import Image from "next/image";
import { useSidebar } from "../../ui/sidebar";

const NavHeader = ({ title = "Transcare EMS" }: { title?: string }) => {
  const { state } = useSidebar();

  return (
    <div className="flex items-center ml-1">
      <Image src='/assets/transcare_logo.png' alt="Logo" width={100} height={100} className="rounded-full size-7 object-cover" />
      <h3 className={`text-[15px] font-bold ml-2 ${state === "expanded" ? "block" : "hidden"}`}>
        {title}
      </h3>
    </div >
  );
};

export default NavHeader;
