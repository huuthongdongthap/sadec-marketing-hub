import os

directory = '/Users/macbookpro/.gemini/antigravity/scratch/sadec-marketing-hub'
css_stack = [
    '    <link rel="stylesheet" href="layout-safe.css">',
    '    <link rel="stylesheet" href="material-components.css">',
    '    <link rel="stylesheet" href="m3-expressive.css">'
]

print("Starting Global CSS Injection...")

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Skip if already injected (checking the last one is enough usually)
        if 'm3-expressive.css' in content:
            print(f"⏭️  Skipping {filename} (Already updated)")
            continue
            
        # Determine insertion point
        # Priority: Before <style>, otherwise before </head>
        insertion_tag = '<style>'
        if insertion_tag not in content:
            insertion_tag = '</head>'
            
        if insertion_tag in content:
            # Join CSS with newlines
            injection = '\n' + '\n'.join(css_stack) + '\n'
            
            # Replace
            new_content = content.replace(insertion_tag, injection + insertion_tag)
            
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"✅ Injected CSS into {filename}")
        else:
            print(f"⚠️  Could not find <style> or </head> in {filename}")

print("Global Injection Complete.")
