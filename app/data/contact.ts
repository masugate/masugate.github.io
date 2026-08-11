import {
  available,
  type Availability,
} from "./contracts";

export interface ContactPerson {
  id: "yuxiang-peng" | "xiaodi-wu";
  name: string;
  affiliation: string;
  profileHref: `https://${string}`;
  profileLabel: string;
}

export interface ContactContract {
  sectionId: "contact";
  anchorHref: "/#contact";
  navigationAction: Readonly<{
    kind: "section";
    label: "Request a customized demo";
    href: "/#contact";
  }>;
  sharedInbox: Readonly<{
    email: "masugate.governance@gmail.com";
    mailtoHref: "mailto:masugate.governance@gmail.com";
  }>;
  requestDemoAction: Availability<
    Readonly<{
      kind: "form";
      label: "Request a customized demo";
      href: string;
    }>
  >;
  people: readonly ContactPerson[];
}

export const contactContract = {
  sectionId: "contact",
  anchorHref: "/#contact",
  navigationAction: {
    kind: "section",
    label: "Request a customized demo",
    href: "/#contact",
  },
  sharedInbox: {
    email: "masugate.governance@gmail.com",
    mailtoHref: "mailto:masugate.governance@gmail.com",
  },
  requestDemoAction: available({
    kind: "form",
    label: "Request a customized demo",
    href: "/#contact",
  }),
  people: [
    {
      id: "yuxiang-peng",
      name: "Yuxiang Peng",
      affiliation: "Purdue University Computer Science",
      profileHref: "https://www.cs.purdue.edu/people/faculty/yxpeng.html",
      profileLabel: "Yuxiang Peng homepage",
    },
    {
      id: "xiaodi-wu",
      name: "Xiaodi Wu",
      affiliation: "University of Maryland Computer Science",
      profileHref: "https://www.cs.umd.edu/people/xiaodiwu",
      profileLabel: "Xiaodi Wu homepage",
    },
  ],
} as const satisfies ContactContract;

export function getContactPerson(
  personId: ContactPerson["id"],
): ContactPerson {
  const person = contactContract.people.find(({ id }) => id === personId);

  if (!person) {
    throw new Error(`Unknown contact person: ${personId}`);
  }

  return person;
}
