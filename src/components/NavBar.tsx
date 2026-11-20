import Logo from "./Logo";
import NavLinks from "./NavLinks";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Logo />
        <NavLinks />
      </div>
    </header>
  );
}
