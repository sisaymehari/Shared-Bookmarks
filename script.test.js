import { test, describe, beforeEach, mock } from 'node:test';
import assert from 'node:assert';

// Mock storage functions
const mockStorage = {
  getData: mock.fn(() => [])
};

// Simple functions to test (without DOM)
function safeGetData(userId) {
  try {
    return mockStorage.getData(userId) || [];
  } catch {
    return [];
  }
}

function sortBookmarks(bookmarks) {
  return bookmarks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function validateBookmark(bookmark) {
  if (!bookmark.url || !bookmark.title || !bookmark.description) {
    return false;
  }
  try {
    new URL(bookmark.url);
    return true;
  } catch {
    return false;
  }
}

describe('Bookmark App Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockStorage.getData.mock.resetCalls();
  });

  test('safeGetData returns empty array when no data', () => {
    // Arrange
    mockStorage.getData.mock.mockImplementationOnce(() => null);

    // Act
    const result = safeGetData("1");

    // Assert
    assert(Array.isArray(result));
    assert.strictEqual(result.length, 0);
  });

  test('sortBookmarks sorts in reverse chronological order', () => {
    // Arrange
    const bookmarks = [
      {
        title: "First Bookmark",
        timestamp: "2023-01-01T10:00:00.000Z"
      },
      {
        title: "Second Bookmark", 
        timestamp: "2023-01-02T10:00:00.000Z"
      }
    ];

    // Act
    const sorted = sortBookmarks([...bookmarks]);

    // Assert
    assert.strictEqual(sorted[0].title, "Second Bookmark"); // newest first
    assert.strictEqual(sorted[1].title, "First Bookmark");
  });

  test('validateBookmark checks required fields and URL format', () => {
    // Valid bookmark
    const validBookmark = {
      url: "https://example.com",
      title: "Test Title",
      description: "Test Description"
    };
    assert.strictEqual(validateBookmark(validBookmark), true);

    // Missing fields
    const invalidBookmark = {
      url: "https://example.com",
      title: "",
      description: "Test Description"
    };
    assert.strictEqual(validateBookmark(invalidBookmark), false);

    // Invalid URL
    const invalidUrl = {
      url: "not-a-url",
      title: "Test Title",
      description: "Test Description"
    };
    assert.strictEqual(validateBookmark(invalidUrl), false);
  });
});