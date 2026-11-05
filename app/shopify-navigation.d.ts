import type { DetailedHTMLProps, HTMLAttributes } from "react";

// App Bridge owns this element; polaris-types 1.0.1 only declares Polaris tags.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "s-app-nav": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
