import { FirestoreError } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

/**
 * Extracts a user-friendly error message from various error types
 * @param error - The error object to extract message from
 * @returns A user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    // Handle Firebase specific errors
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return error.message || 'An error occurred with Firebase.';
    }
  }

  if (error instanceof FirestoreError) {
    // Handle Firestore specific errors
    switch (error.code) {
      case 'permission-denied':
        return 'You do not have permission to perform this action.';
      case 'not-found':
        return 'The requested document was not found.';
      case 'already-exists':
        return 'This document already exists.';
      case 'resource-exhausted':
        return 'The operation was aborted due to resource constraints.';
      case 'failed-precondition':
        return 'The operation was rejected because the system is not in a state required for the operation\'s execution.';
      case 'aborted':
        return 'The operation was aborted.';
      case 'out-of-range':
        return 'The operation was attempted past the valid range.';
      case 'unimplemented':
        return 'The operation is not implemented or not supported/enabled.';
      case 'internal':
        return 'Internal error occurred.';
      case 'unavailable':
        return 'The service is currently unavailable.';
      case 'data-loss':
        return 'Unrecoverable data loss or corruption.';
      case 'unauthenticated':
        return 'The request does not have valid authentication credentials.';
      default:
        return error.message || 'An error occurred with Firestore.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred.';
}; 