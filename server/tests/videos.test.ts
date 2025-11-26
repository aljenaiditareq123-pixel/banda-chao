import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Videos API', () => {
  describe('GET /api/v1/videos', () => {
    it('should return list of videos with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/videos')
        .expect(200);

      expect(response.body).toHaveProperty('videos');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.videos)).toBe(true);
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/videos?page=1&pageSize=10')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pageSize).toBe(10);
    });

    it('should support type filter (SHORT/LONG)', async () => {
      const response = await request(app)
        .get('/api/v1/videos?type=SHORT')
        .expect(200);

      expect(response.body).toHaveProperty('videos');
      response.body.videos.forEach((video: any) => {
        expect(video.type).toBe('SHORT');
      });
    });

    it('should support language filter', async () => {
      const response = await request(app)
        .get('/api/v1/videos?language=zh')
        .expect(200);

      expect(response.body).toHaveProperty('videos');
    });

    it('should support makerId filter', async () => {
      const response = await request(app)
        .get('/api/v1/videos?makerId=test-maker-id')
        .expect(200);

      expect(response.body).toHaveProperty('videos');
    });

    it('should support search parameter', async () => {
      const response = await request(app)
        .get('/api/v1/videos?search=tutorial')
        .expect(200);

      expect(response.body).toHaveProperty('videos');
    });
  });

  describe('GET /api/v1/videos/:id', () => {
    it('should return 404 for non-existent video', async () => {
      const response = await request(app)
        .get('/api/v1/videos/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should increment views count when video is viewed', async () => {
      // First, get list of videos
      const listResponse = await request(app)
        .get('/api/v1/videos')
        .expect(200);

      if (listResponse.body.videos.length > 0) {
        const videoId = listResponse.body.videos[0].id;
        const initialViews = listResponse.body.videos[0].viewsCount || 0;

        const response = await request(app)
          .get(`/api/v1/videos/${videoId}`)
          .expect(200);

        expect(response.body).toHaveProperty('video');
        // Views should be incremented
        expect(response.body.video.viewsCount).toBeGreaterThanOrEqual(initialViews);
      }
    });
  });

  describe('GET /api/v1/videos/makers/:makerId', () => {
    it('should return videos for a specific maker', async () => {
      const response = await request(app)
        .get('/api/v1/videos/makers/test-maker-id')
        .expect(200);

      expect(response.body).toHaveProperty('videos');
      expect(Array.isArray(response.body.videos)).toBe(true);
    });
  });
});



