import { BadRequestException } from "@nestjs/common";

export function sanitizeUpdateData<T extends Record<string, any>>(
  dto: T,
  excludedKeys: string[] = ["id"],
): Partial<T> {
  function sanitize(value: any): any {
    if (Array.isArray(value)) {
      return value.map(sanitize).filter((item) => Object.keys(item).length > 0); // Remove empty objects
    }

    if (typeof value === "object" && value !== null) {
      return Object.fromEntries(
        Object.entries(value)
          .map(([key, val]) => [key, sanitize(val)]) // Recursively sanitize
          .filter(([key, val]) => !excludedKeys.includes(key) && val !== undefined && val !== ""),
      );
    }

    return typeof value === "string" ? value.trim() : value; // Trim string values
  }

  const sanitizedData = sanitize(dto);

  if (Object.keys(sanitizedData).length === 0) {
    throw new BadRequestException("No valid fields provided for update");
  }

  return sanitizedData;
}
