import { useSidebar } from "./ui/sidebar";

const NavHeader = () => {
  const { state } = useSidebar();

  return (
    <div
      className={`text-sm font-bold pt-2 ${
        state === "expanded" ? "block" : "hidden"
      }`}
    >
      Transcare EMS
    </div>
  );
};

export default NavHeader;
