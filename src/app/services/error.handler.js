import { throwError } from 'rxjs';

// Handle API errors
export const handleError = (error) => {
  if (error.error instanceof ErrorEvent) {
    // A client-side or network error occurred. Handle it accordingly.
    console.error('An error occurred:', error.error.message)
  }
  else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong,
    console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`)
  }
  // return an observable with a user-facing error message
  return throwError(error.message || 'Server error')
}

export const showToastOnError = async (toastController, error) => {
  console.log(`showToastOnError -> error`, error)
  const toast = await toastController.create({
    message: error,
    duration: 3000,
  });
  toast.present();
}
