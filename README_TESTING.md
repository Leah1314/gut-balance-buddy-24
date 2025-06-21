
# RAG System Testing Guide

This document explains how to test the ChromaDB connections, ingestions, and queries in your gut health application.

## Test Structure

The test suite is organized into several test classes that mirror your actual use cases:

### 1. `TestRAGSystemInitialization`
- Tests ChromaDB client connection
- Verifies collection creation
- Ensures proper initialization

### 2. `TestHealthProfileIngestion`
- Tests health profile data ingestion (as used in `HealthProfile.tsx`)
- Verifies markdown conversion
- Tests data retrieval for health profiles

### 3. `TestFoodLogIngestion`
- Tests food log ingestion (as used in `useFoodLogsWithRAG`)
- Tests image-based food logging
- Verifies food history retrieval

### 4. `TestStoolLogIngestion`
- Tests stool log ingestion (as used in `useStoolLogsWithRAG`)
- Tests image-based stool analysis
- Verifies stool data storage and retrieval

### 5. `TestImageCaptioning`
- Tests OpenAI image analysis for both food and stool images
- Tests error handling for missing API keys
- Mirrors functionality in `FoodImageAnalyzer` and `StoolImageAnalyzer`

### 6. `TestQueryEnrichment`
- Tests query enrichment with user context (as used in `useRAG.enrichQuery`)
- Verifies that user data is properly incorporated into queries

### 7. `TestUserDataChecking`
- Tests the data availability checking functionality
- Verifies proper user data state detection

### 8. `TestRAGServerIntegration`
- Tests the FastAPI endpoints from `rag_server.py`
- Verifies proper request/response handling
- Tests all endpoints used by your edge function

### 9. `TestErrorHandling`
- Tests various error scenarios
- Ensures graceful handling of edge cases

## Running the Tests

### Prerequisites

1. Install the main project dependencies:
```bash
pip install -r requirements.txt
```

2. The test dependencies will be installed automatically when you run the tests.

### Running Tests

1. **Run all tests:**
```bash
python run_tests.py all
```

2. **Run only unit tests (no external API calls):**
```bash
python run_tests.py unit
```

3. **Run integration tests (requires OpenAI API key):**
```bash
python run_tests.py integration
```

4. **Run tests directly with pytest:**
```bash
pytest test_rag_system.py -v
```

### Environment Variables

For full testing functionality, set these environment variables:

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
export CHROMADB_PATH="./test_chromadb"  # Optional, uses temp directory by default
```

## Test Coverage

The tests cover all major functionality found in your codebase:

- ✅ Health profile ingestion from `HealthProfile.tsx`
- ✅ Food logging from `useFoodLogsWithRAG.ts`
- ✅ Stool logging from `useStoolLogsWithRAG.ts`
- ✅ Image analysis from food/stool image analyzers
- ✅ Query enrichment from `useRAG.ts`
- ✅ RAG service endpoints from `rag_server.py`
- ✅ ChromaDB operations from `rag_module.py`
- ✅ Error handling and edge cases

## Test Data

The tests use realistic sample data based on your actual application:

- **Health Profile**: Age, weight, height, dietary restrictions, medical conditions, medications
- **Food Logs**: Food name, description, notes, timestamps
- **Stool Logs**: Bristol type, consistency, color, notes, timestamps
- **User IDs**: Based on your actual UUID format

## Debugging Failed Tests

If tests fail, check:

1. **ChromaDB Installation**: Ensure ChromaDB is properly installed
2. **OpenAI API Key**: Set the `OPENAI_API_KEY` environment variable for image tests
3. **Permissions**: Ensure write permissions for temporary directories
4. **Dependencies**: Run `pip install -r test_requirements.txt` manually if needed

## Continuous Integration

To run these tests in CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run RAG System Tests
  run: |
    pip install -r requirements.txt
    python run_tests.py unit
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## Adding New Tests

When adding new RAG functionality:

1. Add test cases to the appropriate test class
2. Use the existing fixtures for consistent test data
3. Mock external API calls when appropriate
4. Test both success and error scenarios
