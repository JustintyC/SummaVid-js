import sys
import whisper

# child process for the whisper library so I don't have to use an API key for the whisper API
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 transcribe.py <audio_file_path> <whisper_model>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    whisper_model = sys.argv[2]
    model = whisper.load_model(whisper_model)
    result = model.transcribe(audio=file_path, verbose=False)
    print(result["text"])

if __name__ == "__main__":
    main()
