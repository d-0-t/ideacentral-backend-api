import { countryList } from "./countryList";

// eslint-disable-next-line
export const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
// eslint-disable-next-line
export const urlRegex =
  /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/;
// eslint-disable-next-line
export const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const ageLimit = 13;
export const minBirthDate: number = new Date("1890").getTime();
export const maxBirthDate: number = new Date(
  (new Date().getFullYear() - ageLimit).toString()
).getTime();

let inputKeys: string[] = [
  "username",
  "email",
  "password",
  "login.username",
  "login.email",
  "login.password",

  "avatar",
  "personal.avatar",

  "firstName",
  "lastName",
  "personal.name.firstName",
  "personal.name.lastName",

  "birthday",
  "personal.birthday.date",

  "country",
  "personal.location.country.name",

  "bio",
  "personal.bio",
  "personal.contacts.phone",
  "personal.contacts.email",
  "personal.contacts.links.url",
  "personal.contacts.links.title",

  "title",
  "description",
  "link",
  "comment",
  "message",
  "phone",
];

export type LengthType = {
  [key: string]: { min: number; max: number };
};

export const length: LengthType = {
  username: { min: 3, max: 30 },
  email: { min: 5, max: 254 },
  password: { min: 8, max: 256 },
  "login.username": { min: 5, max: 30 },
  "login.email": { min: 5, max: 254 },
  "login.password": { min: 8, max: 256 },

  avatar: { min: 0, max: 500 },
  "personal.avatar": { min: 0, max: 500 },

  firstName: { min: 0, max: 35 },
  lastName: { min: 0, max: 35 },
  "personal.name.firstName": { min: 0, max: 35 },
  "personal.name.lastName": { min: 0, max: 35 },

  birthday: { min: 10, max: 10 },
  "personal.birthday.date": { min: 10, max: 10 },

  country: { min: 0, max: 50 },
  "personal.location.country.name": { min: 0, max: 50 },

  bio: { min: 0, max: 1000 },
  "personal.bio": { min: 0, max: 1000 },

  phone: { min: 0, max: 20 },
  "personal.contacts.phone": { min: 0, max: 20 },
  "personal.contacts.email": { min: 0, max: 254 },
  "personal.contacts.links.url": { min: 0, max: 500 },
  "personal.contacts.links.title": { min: 0, max: 30 },

  link: { min: 0, max: 500 },
  title: { min: 3, max: 100 },
  description: { min: 0, max: 1000 },
  comment: { min: 1, max: 500 },
  message: { min: 1, max: 1000 },
};

//////////////////////////////////
//////////////////////////////////
//////////////////////////////////

export function inputCheck(text: any, mode: string): boolean | string {
  if (!length.hasOwnProperty(mode)) return false;

  function lengthCheck(): boolean | string {
    if (text.length < length[mode].min) return "short";
    if (text.length > length[mode].max) return "long";
    return false;
  }

  if (lengthCheck()) {
    const errorMessage = `The ${mode}'s length is too ${lengthCheck()} (${
      text.length
    }). It should be between ${length[mode].min} and ${
      length[mode].max
    } characters long.`;
    return errorMessage;
  }

  return false;
}

export function inputObjectCheck(data: any): boolean | string[] {
  let errorArray: string[] = [];

  function runCheck(data: any) {
    for (const [key, value] of Object.entries(data)) {
      // links need to be checked in a different way due to input nulling issues
      if (typeof data[key] === "object" && key !== "links") {
        runCheck(data[key]);
      } else {
        if (inputKeys.includes(key) && key !== "links") {
          let ic = inputCheck(value, key);
          if (ic) {
            //@ts-ignore
            errorArray.push(ic);
          }
        }
      }
    }
  }
  runCheck(data);

  // validity checks
  if (data?.personal?.contacts?.email?.data) {
    let result = emailRegex.test(data.personal.contacts.email.data);
    if (!result) errorArray.push("Invalid email address.");
  }
  if (data?.login?.email) {
    let result = emailRegex.test(data.login.email);
    if (!result) errorArray.push("Invalid email address.");
  }

  if (data?.personal?.contacts?.phone?.data) {
    let result = phoneRegex.test(data.personal.contacts.phone.data);
    if (!result) errorArray.push("Invalid phone number.");
  }

  if (data?.personal?.contacts?.links) {
    let links = data.personal.contacts.links;
    if (links.length > 5) {
      errorArray.push("You can only add up to 5 links to your profile.");
    }
    type LinkType = {
      title: string;
      url: string;
      public: boolean;
    };
    if (Array.isArray(links)) {
      links.forEach((link: LinkType) => {
        if (link.url && link.title && link.url !== "" && link.title !== "") {
          let result = urlRegex.test(link.url);
          if (!result) errorArray.push(`Invalid URL for ${link.title}.`);
          if (link.title.length > length.title.max)
            errorArray.push(
              `The link title's length is too long (${link.title.length}). It should be max ${length.title.max} characters long.`
            );
        } else if (
          (link.url !== "" && link.title === "") ||
          (link.url === "" && link.title !== "")
        ) {
          errorArray.push(`Added link is incomplete.`);
        }
      });
    } else {
      errorArray.push(`Link array is not an array.`);
    }
  }

  if (data?.personal?.birthday?.date) {
    let birthDate = new Date(data.personal.birthday.date);
    //@ts-ignore
    if (birthDate == "Invalid Date") {
      errorArray.push("Invalid date.");
    } else {
      let ageLimit = 13;
      let birthTime: number = birthDate.getTime();
      let minBirthDate: number = new Date("1890").getTime();
      let maxBirthDate: number = new Date(
        (new Date().getFullYear() - ageLimit).toString()
      ).getTime();

      birthTime < minBirthDate
        ? errorArray.push("Date too old - it should be at least 1890.")
        : birthTime > maxBirthDate
        ? errorArray.push(
            `Actually, you need to be at least ${ageLimit} years old to use this platform.`
          )
        : null;
    }
  }
  if (data?.personal?.location?.country?.name) {
    let country = data?.personal?.location?.country?.name;
    if (!countryList.includes(country)) errorArray.push("Invalid country.");
  }

  if (errorArray.length > 0) {
    return errorArray;
  }

  return false;
}

export function eliminateRepeats(data: any[]): string[] {
  let control: any[] = [];
  for (let i = 0; i < data.length; i++) {
    let tag = String(data[i]);
    if (!control.includes(tag) && tag !== "") {
      control.push(tag);
    }
  }
  if (control.length === 0) control = ["no tags"];
  return control;
}
