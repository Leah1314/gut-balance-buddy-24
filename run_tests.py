
#!/usr/bin/env python3
"""
Test runner script for the RAG system
"""
import subprocess
import sys
import os

def install_test_dependencies():
    """Install test dependencies"""
    print("Installing test dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "test_requirements.txt"])
        print("✅ Test dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install test dependencies: {e}")
        return False
    return True

def run_unit_tests():
    """Run unit tests"""
    print("\n🧪 Running unit tests...")
    try:
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "test_rag_system.py", 
            "-v", 
            "-m", "not integration",
            "--tb=short"
        ], capture_output=False)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Failed to run unit tests: {e}")
        return False

def run_integration_tests():
    """Run integration tests (requires ChromaDB and potentially OpenAI API)"""
    print("\n🔗 Running integration tests...")
    try:
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "test_rag_system.py", 
            "-v", 
            "-m", "integration",
            "--tb=short"
        ], capture_output=False)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Failed to run integration tests: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n🚀 Running all tests...")
    try:
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "test_rag_system.py", 
            "-v", 
            "--tb=short"
        ], capture_output=False)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Failed to run tests: {e}")
        return False

def main():
    """Main test runner"""
    print("🧪 RAG System Test Suite")
    print("=" * 50)
    
    # Check if ChromaDB dependencies are available
    try:
        import chromadb
        print("✅ ChromaDB available")
    except ImportError:
        print("❌ ChromaDB not available - install requirements.txt first")
        return 1
    
    # Install test dependencies
    if not install_test_dependencies():
        return 1
    
    # Get command line argument
    test_type = sys.argv[1] if len(sys.argv) > 1 else "all"
    
    success = True
    
    if test_type == "unit":
        success = run_unit_tests()
    elif test_type == "integration":
        success = run_integration_tests()
    elif test_type == "all":
        success = run_all_tests()
    else:
        print(f"Unknown test type: {test_type}")
        print("Usage: python run_tests.py [unit|integration|all]")
        return 1
    
    if success:
        print("\n✅ All tests passed!")
        return 0
    else:
        print("\n❌ Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
