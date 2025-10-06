const communicationsController = require('./communications.controller');

describe('CommunicationsController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 'user-123', role: 'agent' },
      body: {},
      query: {},
      params: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
  });

  describe('list (GET /communications)', () => {
    it('should return list of communications', async () => {
      await communicationsController.list(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
      });
    });
  });

  describe('create (POST /communications)', () => {
    it('should create new communication', async () => {
      mockReq.body = {
        type: 'email',
        subject: 'Test Email',
        body: 'Test body',
      };

      await communicationsController.create(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          type: 'email',
          createdAt: expect.any(String),
        }),
      });
    });
  });

  describe('get (GET /communications/:id)', () => {
    it('should return 404 for non-existent communication', async () => {
      mockReq.params = { id: 'nonexistent' };

      await communicationsController.get(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
      });
    });
  });

  describe('update (PUT /communications/:id)', () => {
    it('should return 404 for non-existent communication', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { subject: 'Updated' };

      await communicationsController.update(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('remove (DELETE /communications/:id)', () => {
    it('should return 204 on successful delete', async () => {
      mockReq.params = { id: 'any-id' };

      await communicationsController.remove(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });
  });
});
