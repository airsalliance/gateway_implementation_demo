local cjson = require 'cjson'
local redis = require 'resty.redis'
local ts = require 'threescale_utils'
local red = redis:new()

function check_client_secret(client_id, secret)
  local res = ngx.location.capture("/_threescale/client_secret_matches",
				  { vars = { client_id = client_id }})
  local real_secret = res.body:match("<key>([^<]+)</key>")
  return (secret == real_secret)
end

function generate_access_token_for(params)
  local ok, err = red:connect("127.0.0.1", 6379)
  ok, err =  red:hgetall("c:".. params.code)
  if ok[1] == nil then
    ngx.say("expired_code")
    return ngx.exit(ngx.HTTP_OK)
  else
    local client_data = red:array_to_hash(ok)
    if params.code == client_data.code and  check_client_secret(params.client_id, params.client_secret) then
        return client_data.pre_access_token
    else
      ngx.header.content_type = "application/json; charset=utf-8"
      ngx.say({'{"error": "invalid authorization code"}'})
      return ngx.exit(ngx.HTTP_FORBIDDEN)
    end
  end
end

local function store_token(client_id, token)
  local stored = ngx.location.capture("/_threescale/oauth_store_token",
    {method = ngx.HTTP_POST,
    body = "provider_key=" ..ngx.var.provider_key ..
    "&app_id=".. client_id ..
    "&token=".. token})
  if stored.status ~= 200 then
    ngx.say("eeeerror")
    ngx.exit(ngx.HTTP_OK)
  end

  ngx.header.content_type = "application/json; charset=utf-8"
  ngx.say({'{"access_token": "'.. token .. '", "token_type": "bearer"}'})
  ngx.exit(ngx.HTTP_OK)
end

function get_token()
  local params = {}
  if "GET" == ngx.req.get_method() then
    params = ngx.req.get_uri_args()
  else
    ngx.req.read_body()
    params = ngx.req.get_post_args()
  end

  local required_params = {'client_id', 'redirect_uri', 'client_secret', 'code', 'grant_type'}

  if ts.required_params_present(required_params, params) and params['grant_type'] == 'authorization_code'  then
    local token = generate_access_token_for(params)
    store_token(params.client_id, token)
  else
    ngx.log(0, "NOPE")
    ngx.exit(ngx.HTTP_FORBIDDEN)
  end
end

local s = get_token()