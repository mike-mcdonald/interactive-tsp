import qs from 'querystring';

import axios from 'axios';

import { IAddressSearchAPI } from '@/address/api/IAddressSearchAPI';
import { AddressCandidate } from '@/address/types';

export class PortlandmapsSuggest implements IAddressSearchAPI {
  async search(query: string): Promise<AddressCandidate[]> {
    const res = await axios.post(
      'https://www.portlandmaps.com/api/suggest/',
      qs.stringify({
        query,
        api_key: '71AF0BE96D3E715CD6139FF5BC6A5305', //process.env.PORTLANDMAPS_API_KEY
        city: 'portland'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (res.status == 200 && res.data && res.data.status === 'success') {
      const data = res.data.candidates;

      return data.map((value: AddressCandidate) => {
        return value;
      });
    } else throw new Error('No addresses found');
  }
}
