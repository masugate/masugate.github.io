import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  MasuGateFooter,
  MasuGateHeader,
  MasuGateUpdateBanner,
} from "../components/MasuGateChrome";
import { SiteMotion } from "../components/motion";
import { createMasuGateSiteMetadata } from "../data/metadata";
import { assertContentContracts } from "../data/validation";
import "./primary.css";

assertContentContracts();

export const metadata: Metadata = createMasuGateSiteMetadata();

export default function MasuGateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="masugate-site">
      <SiteMotion />
      <a className="masugate-skip-link" href="#masugate-main">
        Skip to content
      </a>
      <MasuGateHeader />
      <MasuGateUpdateBanner />
      {children}
      <MasuGateFooter />
    </div>
  );
}
