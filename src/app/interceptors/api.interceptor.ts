import {HttpInterceptorFn} from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }

  return next(req);
};
