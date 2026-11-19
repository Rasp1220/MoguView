import Logo from "./Logo";
import NavLinks from "./NavLinks";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <NavLinks />
      </div>
    </header>
  );
}
