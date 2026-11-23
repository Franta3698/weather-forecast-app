
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface GeocodingResponse {
  name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {

  private http = inject(HttpClient);

getCityByCoordinates(
  latitude: number,
  longitude: number
): Observable<string> {

  const params = new HttpParams()
    .set('lat', latitude)
    .set('lon', longitude)
    .set('format', 'jsonv2');

  return this.http.get<GeocodingResponse>(
    'https://nominatim.openstreetmap.org/reverse',
    { params }
  ).pipe(
    map(response =>
      response.address.city ??
      response.address.town ??
      response.address.village ??
      response.address.municipality ??
      response.name
    )
  );
}
}

