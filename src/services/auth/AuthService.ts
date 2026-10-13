export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class AuthService {
  /**
   * Validates TU Wien student email format (e.g. e01234567@student.tuwien.ac.at)
   */
  public static validateStudentEmail(email: string): ValidationResult {
    const trimmed = email.trim().toLowerCase();
    const regex = /^e[0-9]{7,8}@student\.tuwien\.ac\.at$/;
    if (!regex.test(trimmed)) {
      return {
        valid: false,
        error: "Email must be a valid student address (e.g. e01234567@student.tuwien.ac.at)",
      };
    }
    return { valid: true };
  }

  /**
   * Validates TU Wien 7 or 8-digit matriculation number
   */
  public static validateMatriculationNumber(matrNr: string): ValidationResult {
    const trimmed = matrNr.trim();
    if (!/^[0-9]{7,8}$/.test(trimmed)) {
      return {
        valid: false,
        error: "Matriculation number must consist of 7 or 8 digits",
      };
    }
    return { valid: true };
  }
}
