import torch
import os

def check_weights(path):
    if not os.path.exists(path):
        print(f"File {path} not found.")
        return
    
    print(f"Loading {path}...")
    try:
        # Weights are usually a dictionary or a model object
        ckpt = torch.load(path, map_location='cpu', weights_only=False)
        if isinstance(ckpt, dict):
            print(f"Keys found: {list(ckpt.keys())}")
            if 'epoch' in ckpt:
                print(f"Epoch: {ckpt['epoch']}")
            if 'best_fitness' in ckpt:
                print(f"Best Fitness: {ckpt['best_fitness']}")
            if 'model' in ckpt:
                print("Model weights detected in checkpoint.")
            # Print a few more useful keys
            for key in ['date', 'version', 'nc']:
                if key in ckpt:
                    print(f"{key}: {ckpt[key]}")
        else:
            print(f"Object type: {type(ckpt)}")
    except Exception as e:
        print(f"Error loading: {e}")

if __name__ == "__main__":
    check_weights('server/best.pt')
