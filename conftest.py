
import pytest
import sys
import os

# Add the project root to Python path so we can import modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure pytest
def pytest_configure(config):
    """Configure pytest with custom settings"""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
