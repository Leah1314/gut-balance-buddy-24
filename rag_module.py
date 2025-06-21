
import chromadb
from chromadb.config import Settings
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import markdown
import openai
import os

class RAG:
    def __init__(self, chromadb_path: str = "./chromadb", openai_api_key: Optional[str] = None):
        """
        Initialize the RAG system with ChromaDB
        
        Args:
            chromadb_path: Path to ChromaDB storage
            openai_api_key: OpenAI API key for image captioning
        """
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=chromadb_path,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Create or get collections
        self.health_collection = self.client.get_or_create_collection(
            name="user_health_info",
            metadata={"hnsw:space": "cosine"}
        )
        
        self.history_collection = self.client.get_or_create_collection(
            name="user_history",
            metadata={"hnsw:space": "cosine"}
        )
        
        # Set OpenAI API key
        if openai_api_key:
            openai.api_key = openai_api_key
        elif os.getenv('OPENAI_API_KEY'):
            openai.api_key = os.getenv('OPENAI_API_KEY')
    
    def ingest_textual_data(self, 
                          text: str, 
                          user_id: str, 
                          data_type: str = "health_info",
                          source: str = "manual",
                          content_type: str = "profile",
                          additional_metadata: Dict[str, Any] = None) -> str:
        """
        Ingest textual data into vector database
        
        Args:
            text: Raw text to ingest
            user_id: Unique user identifier
            data_type: "health_info" or "track_history"
            source: "manual" or "image"
            content_type: "food", "stool", "profile"
            additional_metadata: Extra metadata to store
            
        Returns:
            Document ID of ingested data
        """
        # Convert text to markdown format
        converted_text = self.convert_to_format(text, "markdown")
        
        # Create document ID
        doc_id = str(uuid.uuid4())
        
        # Prepare metadata
        metadata = {
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "data_type": data_type,
            "source": source,
            "content_type": content_type,
            "doc_id": doc_id
        }
        
        if additional_metadata:
            metadata.update(additional_metadata)
        
        # Choose appropriate collection
        collection = self.health_collection if data_type == "health_info" else self.history_collection
        
        # Add document to collection
        collection.add(
            documents=[converted_text],
            metadatas=[metadata],
            ids=[doc_id]
        )
        
        return doc_id
    
    def convert_to_format(self, text: str, format_type: str = "markdown") -> str:
        """
        Convert textual input into desired format
        
        Args:
            text: Input text to convert
            format_type: Target format (currently supports "markdown")
            
        Returns:
            Converted text
        """
        if format_type.lower() == "markdown":
            # If text is already markdown-like, return as is
            if any(marker in text for marker in ['#', '*', '-', '`', '|']):
                return text
            
            # Convert plain text to markdown format
            lines = text.split('\n')
            markdown_lines = []
            
            for line in lines:
                line = line.strip()
                if not line:
                    markdown_lines.append('')
                    continue
                
                # Convert key-value pairs to markdown
                if ':' in line and not line.startswith('#'):
                    key, value = line.split(':', 1)
                    markdown_lines.append(f"**{key.strip()}**: {value.strip()}")
                else:
                    markdown_lines.append(line)
            
            return '\n'.join(markdown_lines)
        
        return text
    
    def handle_image_embedding(self, image_data: bytes, user_id: str, content_type: str = "food") -> str:
        """
        Handle image embedding (placeholder for implementation)
        
        Args:
            image_data: Raw image bytes
            user_id: User identifier
            content_type: Type of image content
            
        Returns:
            Document ID of processed image
        """
        # This method will be implemented to:
        # 1. Use OpenAI Vision API to caption the image
        # 2. Convert caption to markdown
        # 3. Ingest the caption into vector database
        pass
    
    def caption_image(self, image_data: bytes, content_type: str = "food") -> str:
        """
        Generate caption for image using OpenAI Vision API
        
        Args:
            image_data: Raw image bytes
            content_type: Type of image content
            
        Returns:
            Generated caption
        """
        try:
            import base64
            
            # Convert image to base64
            base64_image = base64.b64encode(image_data).decode('utf-8')
            
            # Create appropriate prompt based on content type
            if content_type == "food":
                prompt = "Analyze this food image and describe: 1) What food items are visible, 2) Estimated portions/quantities, 3) Preparation method if apparent, 4) Any nutritional observations. Format as structured text."
            elif content_type == "stool":
                prompt = "Analyze this stool sample image and describe: 1) Bristol stool scale type, 2) Color characteristics, 3) Consistency observations, 4) Any notable features. Format as structured medical observation."
            else:
                prompt = "Describe this image in detail, focusing on relevant health or dietary information."
            
            response = openai.ChatCompletion.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Error generating caption: {str(e)}"
    
    def retrieve_user_data(self, user_id: str, query: str, n_results: int = 5) -> Dict[str, List[str]]:
        """
        Retrieve user-specific data using similarity search
        
        Args:
            user_id: User identifier for filtering
            query: Search query
            n_results: Number of results to return
            
        Returns:
            Dictionary with health_info and track_history results
        """
        results = {
            "health_info": [],
            "track_history": []
        }
        
        # Search health info collection
        try:
            health_results = self.health_collection.query(
                query_texts=[query],
                n_results=n_results,
                where={"user_id": user_id}
            )
            
            if health_results['documents'] and health_results['documents'][0]:
                results["health_info"] = health_results['documents'][0]
        except Exception as e:
            print(f"Error querying health collection: {e}")
        
        # Search history collection
        try:
            history_results = self.history_collection.query(
                query_texts=[query],
                n_results=n_results,
                where={"user_id": user_id}
            )
            
            if history_results['documents'] and history_results['documents'][0]:
                results["track_history"] = history_results['documents'][0]
        except Exception as e:
            print(f"Error querying history collection: {e}")
        
        return results
    
    def check_user_has_data(self, user_id: str) -> Dict[str, bool]:
        """
        Check if user has existing data in the system
        
        Args:
            user_id: User identifier
            
        Returns:
            Dictionary indicating data availability
        """
        has_data = {
            "health_info": False,
            "track_history": False
        }
        
        try:
            # Check health info
            health_count = self.health_collection.count()
            if health_count > 0:
                health_results = self.health_collection.get(where={"user_id": user_id}, limit=1)
                has_data["health_info"] = len(health_results['ids']) > 0
            
            # Check track history
            history_count = self.history_collection.count()
            if history_count > 0:
                history_results = self.history_collection.get(where={"user_id": user_id}, limit=1)
                has_data["track_history"] = len(history_results['ids']) > 0
                
        except Exception as e:
            print(f"Error checking user data: {e}")
        
        return has_data
    
    def update_health_profile(self, user_id: str, profile_data: Dict[str, Any]) -> str:
        """
        Update user health profile in vector database
        
        Args:
            user_id: User identifier
            profile_data: Health profile data
            
        Returns:
            Document ID of updated profile
        """
        # Convert profile data to text
        profile_text = ""
        for key, value in profile_data.items():
            if value is not None and value != "":
                profile_text += f"{key}: {value}\n"
        
        return self.ingest_textual_data(
            text=profile_text,
            user_id=user_id,
            data_type="health_info",
            source="manual",
            content_type="profile"
        )
    
    def update_track_history(self, user_id: str, track_data: Dict[str, Any], has_image: bool = False) -> str:
        """
        Update user tracking history in vector database
        
        Args:
            user_id: User identifier
            track_data: Tracking data
            has_image: Whether this entry includes image data
            
        Returns:
            Document ID of updated history
        """
        # Convert track data to text
        track_text = ""
        for key, value in track_data.items():
            if value is not None and value != "":
                track_text += f"{key}: {value}\n"
        
        return self.ingest_textual_data(
            text=track_text,
            user_id=user_id,
            data_type="track_history",
            source="image" if has_image else "manual",
            content_type=track_data.get("type", "general"),
            additional_metadata={"entry_type": "tracking"}
        )
