import axios from 'axios';
import FormData from 'form-data';

export const uploadClient = {
  async uploadFile(fileBuffer: Buffer, filename: string, mimetype: string) {
    const formData = new FormData();
    formData.append('file', fileBuffer, { filename, contentType: mimetype });

    const response = await axios.post(`${process.env.BASE_URL || 'http://localhost:3000'}/upload/upload`, formData, {
      headers: formData.getHeaders()
    });

    return response.data;
  }
};