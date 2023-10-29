import {
  DomainResponse,
  DomainConfigResponse,
  DomainVerificationResponse,
} from "@/lib/types";

export const getSubdomain = (name: string, apexName: string) => {
  if (name === apexName) return null;
  return name.slice(0, name.length - apexName.length - 1);
};
