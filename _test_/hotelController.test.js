// hotelController.test.js

const { getAllHotels } = require("../controllers/hotelController");
const { readHotelsFile } = require("../models/hotelModel");

// Mock the readHotelsFile function to avoid reading from the file system
jest.mock("../models/hotelModel", () => ({
  readHotelsFile: jest.fn(),
}));

describe("Hotel Controller - getAllHotels", () => {
  it("should return a list of hotels with a 201 status", async () => {
    // Mock data to be returned by readHotelsFile
    const mockHotelsData = [
      {
        hotel_id: "1",
        title: "Hotel California",
        guest_count: 2,
        bedroom_count: 1,
        bathroom_count: 1,
        amenities: ["WiFi", "Parking"],
      },
    ];

    // Set up mock to return the mockHotelsData
    readHotelsFile.mockResolvedValue(mockHotelsData);

    // Mock the response object
    const req = {}; // Empty request object
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the getAllHotels function
    await getAllHotels(req, res);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Find all Hotels successfully",
      hotel: mockHotelsData,
    });
  });
});
