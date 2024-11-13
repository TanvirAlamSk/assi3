const { uploadImages } = require("../controllers/imageController");
const fs = require("fs");
// const { readHotelsFile, writeHotelsFile } = require("../models/hotelModel");
// const fs = jest.fn();
const readHotelsFile = jest.fn();
const writeHotelsFile = jest.fn();

jest.mock("fs", () => ({
  mkdirSync: jest.fn(),
  // fs,
}));
jest.mock("../models/hotelModel", () => ({
  readHotelsFile: jest.fn(() => readHotelsFileValue),
  writeHotelsFile: jest.fn(),
}));

describe("uploadImages", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        hotel_id: 1,
      },
      files: [
        {
          originalname: "test-image.jpg",
          filename: "1234567890-123456789.jpg",
        },
      ],
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should upload images and update hotel record successfully", async () => {
    const hotels = [{ hotel_id: 1, images: [] }];
    readHotelsFile.mockReturnValue(hotels);

    await uploadImages(req, res);

    expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledWith(req, res, expect.anyFunction());

    expect(writeHotelsFile).toHaveBeenCalledWith([
      { hotel_id: 1, images: ["/uploads/1/1234567890-123456789.jpg"] },
    ]);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Images uploaded successfully",
      imageUrls: ["/uploads/1/1234567890-123456789.jpg"],
    });
  });

  it("should handle hotel not found error", async () => {
    readHotelsFile.mockReturnValue([]);

    await uploadImages(req, res);

    expect(writeHotelsFile).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Hotel not found" });
  });

  it("should handle general error during update", async () => {
    const hotels = [{ hotel_id: 1, images: [] }];
    readHotelsFile.mockReturnValue(hotels);
    writeHotelsFile.mockImplementationOnce(() => {
      throw new Error("Update failed");
    });

    await uploadImages(req, res);

    expect(writeHotelsFile).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to update hotel record",
    });
  });
});
