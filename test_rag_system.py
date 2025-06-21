
import pytest
import tempfile
import shutil
import os
from datetime import datetime
import base64
from unittest.mock import Mock, patch, MagicMock
from rag_module import RAG

# Test fixtures
@pytest.fixture
def temp_chromadb_path():
    """Create a temporary directory for ChromaDB testing"""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)

@pytest.fixture
def rag_instance(temp_chromadb_path):
    """Create a RAG instance for testing"""
    return RAG(chromadb_path=temp_chromadb_path)

@pytest.fixture
def mock_openai():
    """Mock OpenAI API calls"""
    with patch('openai.ChatCompletion.create') as mock_create:
        mock_create.return_value = Mock(
            choices=[Mock(message=Mock(content="Test image analysis: Contains food items including salad and protein."))]
        )
        yield mock_create

@pytest.fixture
def sample_user_id():
    """Sample user ID for testing"""
    return "09618122-db85-4316-b54e-568412cc0724"

@pytest.fixture
def sample_health_profile():
    """Sample health profile data based on your HealthProfile component"""
    return {
        "age": 30,
        "weight_kg": 70.5,
        "height_cm": 175.0,
        "activity_level": "moderate",
        "dietary_restrictions": {"vegetarian": True, "gluten_free": False},
        "medical_conditions": ["IBS", "lactose intolerance"],
        "medications": ["probiotics", "vitamin D"],
        "symptoms_notes": "Occasional bloating after meals",
        "custom_restrictions": "Avoiding high FODMAP foods"
    }

@pytest.fixture
def sample_food_log():
    """Sample food log data based on your food tracking"""
    return {
        "food_name": "Grilled Chicken Salad",
        "description": "Mixed greens with grilled chicken breast, cherry tomatoes, and olive oil dressing",
        "notes": "Feeling good after this meal",
        "timestamp": datetime.now().isoformat()
    }

@pytest.fixture
def sample_stool_log():
    """Sample stool log data based on your stool tracking"""
    return {
        "bristol_type": 4,
        "consistency": "smooth",
        "color": "brown",
        "notes": "Normal bowel movement, no discomfort",
        "timestamp": datetime.now().isoformat()
    }

class TestRAGSystemInitialization:
    """Test RAG system initialization and connections"""
    
    def test_rag_initialization_creates_collections(self, temp_chromadb_path):
        """Test that RAG initialization creates the required collections"""
        rag = RAG(chromadb_path=temp_chromadb_path)
        
        # Check that collections are created
        assert rag.health_collection is not None
        assert rag.history_collection is not None
        
        # Check collection names
        assert rag.health_collection.name == "user_health_info"
        assert rag.history_collection.name == "user_history"
    
    def test_chromadb_client_connection(self, rag_instance):
        """Test ChromaDB client connection"""
        # Client should be accessible and functional
        assert rag_instance.client is not None
        
        # Should be able to list collections
        collections = rag_instance.client.list_collections()
        collection_names = [col.name for col in collections]
        
        assert "user_health_info" in collection_names
        assert "user_history" in collection_names

class TestHealthProfileIngestion:
    """Test health profile data ingestion based on HealthProfile component"""
    
    def test_ingest_health_profile_text(self, rag_instance, sample_user_id, sample_health_profile):
        """Test ingesting health profile data as used in useHealthProfileRAG"""
        # Convert profile data to text format as done in useRAG.ingestHealthProfile
        profile_text = "\n".join([
            f"{key}: {value}" for key, value in sample_health_profile.items()
            if value is not None and value != ""
        ])
        
        metadata = {
            "user_id": sample_user_id,
            "data_type": "health_info",
            "source": "manual",
            "content_type": "profile"
        }
        
        doc_id = rag_instance.ingest_text(profile_text, metadata)
        
        assert doc_id is not None
        assert isinstance(doc_id, str)
    
    def test_health_profile_markdown_conversion(self, rag_instance, sample_health_profile):
        """Test that health profile data is converted to markdown format"""
        profile_text = "\n".join([
            f"{key}: {value}" for key, value in sample_health_profile.items()
            if value is not None and value != ""
        ])
        
        converted = rag_instance.convert_text_to_format(profile_text, "markdown")
        
        # Should contain markdown formatting
        assert "**age**:" in converted.lower()
        assert "**weight_kg**:" in converted.lower()
        assert "**activity_level**:" in converted.lower()
    
    def test_retrieve_health_profile(self, rag_instance, sample_user_id, sample_health_profile):
        """Test retrieving health profile data"""
        # First ingest the data
        profile_text = "\n".join([
            f"{key}: {value}" for key, value in sample_health_profile.items()
            if value is not None and value != ""
        ])
        
        metadata = {
            "user_id": sample_user_id,
            "data_type": "health_info",
            "source": "manual",
            "content_type": "profile"
        }
        
        rag_instance.ingest_text(profile_text, metadata)
        
        # Now retrieve it
        results = rag_instance.retrieve_user_data(sample_user_id, "dietary restrictions", 5)
        
        assert "health_info" in results
        assert "track_history" in results
        assert len(results["health_info"]) > 0

class TestFoodLogIngestion:
    """Test food log ingestion based on useFoodLogsWithRAG"""
    
    def test_ingest_food_log_text(self, rag_instance, sample_user_id, sample_food_log):
        """Test ingesting food log data as done in useFoodLogsWithRAG"""
        # Convert food data to text as done in the hook
        food_text = "\n".join([
            f"{key}: {value}" for key, value in sample_food_log.items()
            if value is not None and value != ""
        ])
        
        metadata = {
            "user_id": sample_user_id,
            "data_type": "track_history",
            "source": "manual",
            "content_type": "food"
        }
        
        doc_id = rag_instance.ingest_text(food_text, metadata)
        
        assert doc_id is not None
        assert isinstance(doc_id, str)
    
    def test_ingest_food_with_image(self, rag_instance, sample_user_id, mock_openai):
        """Test ingesting food log with image as done in the food analyzer"""
        # Create mock image data
        mock_image_data = base64.b64encode(b"fake_image_data").decode('utf-8')
        
        metadata = {
            "user_id": sample_user_id,
            "data_type": "track_history",
            "source": "image",
            "content_type": "food"
        }
        
        # Convert base64 to bytes as the function expects
        image_bytes = base64.b64decode(mock_image_data)
        
        doc_id = rag_instance.ingest_image(image_bytes, metadata)
        
        assert doc_id is not None
        assert isinstance(doc_id, str)
        assert mock_openai.called
    
    def test_retrieve_food_history(self, rag_instance, sample_user_id, sample_food_log):
        """Test retrieving food history for meal analysis"""
        # Ingest food data
        food_text = "\n".join([
            f"{key}: {value}" for key, value in sample_food_log.items()
            if value is not None and value != ""
        ])
        
        metadata = {
            "user_id": sample_user_id,
            "data_type": "track_history",
            "source": "manual",
            "content_type": "food"
        }
        
        rag_instance.ingest_text(food_text, metadata)
        
        # Retrieve food-related data
        results = rag_instance.retrieve_user_data(sample_user_id, "chicken salad", 5)
        
        assert "track_history" in results
        assert len(results["track_history"]) > 0

class TestStoolLogIngestion:
    """Test stool log ingestion based on useStoolLogsWithRAG"""
    
    def test_ingest_stool_log_text(self, rag_instance, sample_user_id, sample_stool_log):
        """Test ingesting stool log data as done in useStoolLogsWithRAG"""
        stool_text = "\n".join([
            f"{key}: {value}" for key, value in sample_stool_log.items()
            if value is not None and value != ""
        ])
        
        metadata = {
            "user_id": sample_user_id,
            "data_type": "track_history",
            "source": "manual",
            "content_type": "stool"
        }
        
        doc_id = rag_instance.ingest_text(stool_text, metadata)
        
        assert doc_id is not None
        assert isinstance(doc_id, str)
    
    def test_ingest_stool_with_image(self, rag_instance, sample_user_id, mock_openai):
        """Test ingesting stool log with image analysis"""
        mock_image_data = base64.b64encode(b"fake_stool_image_data").decode('utf-8')
        
        metadata = {
            "user_id": sample_user_id,
            "data_type": "track_history",
            "source": "image",
            "content_type": "stool"
        }
        
        image_bytes = base64.b64decode(mock_image_data)
        doc_id = rag_instance.ingest_image(image_bytes, metadata)
        
        assert doc_id is not None
        assert isinstance(doc_id, str)
        assert mock_openai.called

class TestImageCaptioning:
    """Test image captioning functionality used in image analyzers"""
    
    def test_food_image_captioning(self, rag_instance, mock_openai):
        """Test food image captioning as used in FoodImageAnalyzer"""
        mock_image_data = b"fake_food_image_data"
        
        caption = rag_instance.caption_image(mock_image_data, "food")
        
        assert caption is not None
        assert len(caption) > 0
        assert mock_openai.called
    
    def test_stool_image_captioning(self, rag_instance, mock_openai):
        """Test stool image captioning as used in StoolImageAnalyzer"""
        mock_image_data = b"fake_stool_image_data"
        
        caption = rag_instance.caption_image(mock_image_data, "stool")
        
        assert caption is not None
        assert len(caption) > 0
        assert mock_openai.called
    
    def test_image_captioning_error_handling(self, rag_instance):
        """Test image captioning with invalid API key"""
        # Create RAG instance without OpenAI API key
        rag_no_key = RAG(chromadb_path=rag_instance.client._settings.persist_directory)
        
        mock_image_data = b"fake_image_data"
        caption = rag_no_key.caption_image(mock_image_data, "food")
        
        # Should return error message instead of crashing
        assert "Error generating caption" in caption

class TestQueryEnrichment:
    """Test query enrichment functionality used in chat systems"""
    
    def test_enrich_query_with_user_data(self, rag_instance, sample_user_id, sample_health_profile, sample_food_log):
        """Test query enrichment as used in useRAG.enrichQuery"""
        # First ingest some data
        profile_text = "\n".join([
            f"{key}: {value}" for key, value in sample_health_profile.items()
            if value is not None and value != ""
        ])
        
        rag_instance.ingest_text(profile_text, {
            "user_id": sample_user_id,
            "data_type": "health_info",
            "source": "manual",
            "content_type": "profile"
        })
        
        food_text = "\n".join([
            f"{key}: {value}" for key, value in sample_food_log.items()
            if value is not None and value != ""
        ])
        
        rag_instance.ingest_text(food_text, {
            "user_id": sample_user_id,
            "data_type": "track_history",
            "source": "manual",
            "content_type": "food"
        })
        
        # Test query enrichment
        original_query = "What should I eat for better digestion?"
        enriched_query = rag_instance.enrichQuery(original_query, sample_user_id)
        
        assert len(enriched_query) > len(original_query)
        assert "Health Profile" in enriched_query or "Tracking History" in enriched_query

class TestUserDataChecking:
    """Test user data checking functionality"""
    
    def test_check_user_has_no_data(self, rag_instance, sample_user_id):
        """Test checking for user data when none exists"""
        has_data = rag_instance.check_user_has_data(sample_user_id)
        
        assert "health_info" in has_data
        assert "track_history" in has_data
        assert has_data["health_info"] is False
        assert has_data["track_history"] is False
    
    def test_check_user_has_health_data(self, rag_instance, sample_user_id, sample_health_profile):
        """Test checking for user data when health data exists"""
        # Ingest health data
        profile_text = "\n".join([
            f"{key}: {value}" for key, value in sample_health_profile.items()
            if value is not None and value != ""
        ])
        
        rag_instance.ingest_text(profile_text, {
            "user_id": sample_user_id,
            "data_type": "health_info",
            "source": "manual",
            "content_type": "profile"
        })
        
        has_data = rag_instance.check_user_has_data(sample_user_id)
        
        assert has_data["health_info"] is True
        assert has_data["track_history"] is False
    
    def test_check_user_has_tracking_data(self, rag_instance, sample_user_id, sample_food_log):
        """Test checking for user data when tracking data exists"""
        # Ingest tracking data
        food_text = "\n".join([
            f"{key}: {value}" for key, value in sample_food_log.items()
            if value is not None and value != ""
        ])
        
        rag_instance.ingest_text(food_text, {
            "user_id": sample_user_id,
            "data_type": "track_history",
            "source": "manual",
            "content_type": "food"
        })
        
        has_data = rag_instance.check_user_has_data(sample_user_id)
        
        assert has_data["health_info"] is False
        assert has_data["track_history"] is True

class TestRAGServerIntegration:
    """Test RAG server endpoints as used by the edge function"""
    
    @patch('rag_server.rag')
    def test_ingest_endpoint_health_profile(self, mock_rag):
        """Test /ingest endpoint for health profile data"""
        from rag_server import app
        from fastapi.testclient import TestClient
        
        mock_rag.ingest_text.return_value = "test-doc-id"
        
        client = TestClient(app)
        
        request_data = {
            "text": "age: 30\nweight_kg: 70.5\nactivity_level: moderate",
            "user_id": "test-user-id",
            "data_type": "health_info",
            "source": "manual",
            "content_type": "profile"
        }
        
        response = client.post("/ingest", json=request_data)
        
        assert response.status_code == 200
        assert response.json()["success"] is True
        assert response.json()["doc_id"] == "test-doc-id"
        mock_rag.ingest_text.assert_called_once()
    
    @patch('rag_server.rag')
    def test_retrieve_endpoint(self, mock_rag):
        """Test /retrieve endpoint for querying user data"""
        from rag_server import app
        from fastapi.testclient import TestClient
        
        mock_rag.retrieve_user_data.return_value = {
            "health_info": ["user health data"],
            "track_history": ["user tracking data"]
        }
        
        client = TestClient(app)
        
        request_data = {
            "user_id": "test-user-id",
            "query": "dietary restrictions",
            "n_results": 5
        }
        
        response = client.post("/retrieve", json=request_data)
        
        assert response.status_code == 200
        result = response.json()
        assert "health_info" in result
        assert "track_history" in result
        mock_rag.retrieve_user_data.assert_called_once()
    
    @patch('rag_server.rag')
    def test_check_data_endpoint(self, mock_rag):
        """Test /check_data endpoint"""
        from rag_server import app
        from fastapi.testclient import TestClient
        
        mock_rag.check_user_has_data.return_value = {
            "health_info": True,
            "track_history": False
        }
        
        client = TestClient(app)
        
        request_data = {
            "user_id": "test-user-id"
        }
        
        response = client.post("/check_data", json=request_data)
        
        assert response.status_code == 200
        result = response.json()
        assert result["health_info"] is True
        assert result["track_history"] is False
        mock_rag.check_user_has_data.assert_called_once()

class TestErrorHandling:
    """Test error handling in various scenarios"""
    
    def test_invalid_user_id_query(self, rag_instance):
        """Test querying with invalid user ID"""
        results = rag_instance.retrieve_user_data("invalid-user-id", "test query", 5)
        
        # Should return empty results, not crash
        assert "health_info" in results
        assert "track_history" in results
        assert len(results["health_info"]) == 0
        assert len(results["track_history"]) == 0
    
    def test_empty_text_ingestion(self, rag_instance, sample_user_id):
        """Test ingesting empty text"""
        metadata = {
            "user_id": sample_user_id,
            "data_type": "health_info",
            "source": "manual",
            "content_type": "profile"
        }
        
        doc_id = rag_instance.ingest_text("", metadata)
        
        # Should handle empty text gracefully
        assert doc_id is not None
    
    def test_malformed_metadata(self, rag_instance, sample_user_id):
        """Test ingesting with malformed metadata"""
        # Missing required fields
        metadata = {
            "user_id": sample_user_id
            # Missing data_type, source, content_type
        }
        
        # Should use defaults and not crash
        doc_id = rag_instance.ingest_text("test text", metadata)
        assert doc_id is not None

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
