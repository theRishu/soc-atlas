# SOCAtlas - Dummy Entrypoint to satisfy Vercel's Python detector.
# This file is NOT used for serving; it only exists to stop the 'No python entrypoint found' error.
def app(environ, start_response):
    status = '200 OK'
    headers = [('Content-Type', 'text/plain')]
    start_response(status, headers)
    return [b"SOCAtlas Static Build Engine is Active."]
