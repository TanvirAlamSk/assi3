// test/hotel.test.js
const request = require("supertest"); // To make HTTP requests
const fs = require("fs");
const path = require("path");
const app = require("../with MVC/app");

jest.mock("fs"); // Mock fs module to avoid filesystem interactions

describe("Hotel API", () => {
  // Mock file system operations
  beforeAll(() => {
    fs.readFileSync.mockImplementation(() => JSON.stringify([]));
    fs.writeFileSync.mockImplementation(() => {});
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  // ------------------ Test: GET /hotel (Fetch all hotels) ------------------
  describe("GET /hotel", () => {
    it("should retrieve all hotels", async () => {
      const res = await request(app).get("/hotel");

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty(
        "message",
        "Find all Hotels successfully"
      );
      expect(res.body).toHaveProperty("hotel");
      expect(Array.isArray(res.body.hotel)).toBe(true);
    });
  });

  // ------------------ Test: POST /hotel (Create new hotel) ------------------
  describe("POST /hotel", () => {
    it("should create a new hotel with valid data", async () => {
      const newHotel = {
        hotel_id: "1",
        title: "Hotel California",
        images: [],
        description: "A lovely place",
        guest_count: 2,
        bedroom_count: 1,
        bathroom_count: 1,
        amenities: ["WiFi", "Parking"],
        host_information: { name: "John Doe" },
        address: "Somewhere in California",
        latitude: 36.7783,
        longitude: -119.4179,
        room_title: "Deluxe Room",
      };

      const res = await request(app).post("/hotel").send(newHotel);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "Hotel added successfully");
      expect(res.body.hotel).toMatchObject({
        hotel_id: "1",
        title: "Hotel California",
      });
    });

    it("should return 400 if required fields are missing", async () => {
      const incompleteHotel = { hotel_id: "2" }; // Missing fields

      const res = await request(app).post("/hotel").send(incompleteHotel);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch("Requere all those fields");
    });
  });

  // ------------------ Test: GET /hotel/:id (Get specific hotel) ------------------
  describe("GET /hotel/:id", () => {
    it("should retrieve a specific hotel by ID", async () => {
      const hotelId = "1";
      fs.readFileSync.mockReturnValueOnce(
        JSON.stringify([{ hotel_id: hotelId, title: "Hotel California" }])
      );

      const res = await request(app).get(`/hotel/${hotelId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Find this Hotel successfully"
      );
      expect(res.body.hotel).toHaveProperty("hotel_id", hotelId);
    });

    it("should return 404 if hotel not found", async () => {
      const res = await request(app).get("/hotel/999");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Cound Not Find This Hotel");
    });
  });

  // ------------------ Test: PUT /hotel/:id (Update specific hotel) ------------------
  describe("PUT /hotel/:id", () => {
    it("should update hotel information if hotel exists", async () => {
      const hotelId = "1";
      const updateData = { title: "Updated Hotel California" };

      fs.readFileSync.mockReturnValueOnce(
        JSON.stringify([{ hotel_id: hotelId, title: "Hotel California" }])
      );

      const res = await request(app).put(`/hotel/${hotelId}`).send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Hotel updated successfully");
      expect(res.body.hotel).toHaveProperty(
        "title",
        "Updated Hotel California"
      );
    });

    it("should return an error if the hotel does not exist", async () => {
      const res = await request(app)
        .put("/hotel/999")
        .send({ title: "Non-existent Hotel" });

      expect(res.text).toBe("This Hotel doesn't exists");
    });
  });

  // ------------------ Test: POST /images (Upload images) ------------------
  describe("POST /images", () => {
    it("should upload images successfully", async () => {
      const hotelId = "1";
      fs.existsSync.mockReturnValueOnce(true); // Mock directory exists
      fs.mkdirSync.mockImplementation(() => {}); // Mock directory creation

      const res = await request(app)
        .post("/images")
        .field("hotel_id", hotelId)
        .attach("images", path.resolve(__dirname, "test-image.jpg"));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Images uploaded successfully"
      );
      expect(res.body).toHaveProperty("imageUrls");
      expect(Array.isArray(res.body.imageUrls)).toBe(true);
    });

    it("should return an error if hotel_id is missing", async () => {
      const res = await request(app)
        .post("/images")
        .attach("images", path.resolve(__dirname, "test-image.jpg"));

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "hotel_id is required");
    });
  });
});
