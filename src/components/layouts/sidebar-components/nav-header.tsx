import { useSidebar } from "../../ui/sidebar";

const NavHeader = ({ title = "Transcare EMS" }: { title?: string }) => {
  const { state } = useSidebar();

  return (
    <div
      className={`text-sm font-bold pt-2 ${
        state === "expanded" ? "block" : "hidden"
      }`}
    >
      {title}
    </div>
  );
};

export default NavHeader;
