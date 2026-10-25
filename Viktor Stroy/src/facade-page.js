const pathname = window.location.pathname;

const isFacadePage = pathname.startsWith("/uteplenie-fasada");
const isFloorPage = pathname.startsWith("/uteplenie-polov");

export { isFacadePage, isFloorPage };
