-- Function برای ایجاد OTP
CREATE OR REPLACE FUNCTION create_otp(p_phone_number TEXT)
RETURNS JSON AS $$
DECLARE
  v_code TEXT;
  v_otp_id UUID;
BEGIN
  -- ایجاد کد 4 رقمی تصادفی
  v_code := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  -- حذف OTP های قبلی همین شماره که verify نشده‌اند
  DELETE FROM otp_codes
  WHERE phone_number = p_phone_number
    AND verified = FALSE;

  -- ایجاد OTP جدید
  INSERT INTO otp_codes (phone_number, code, expires_at)
  VALUES (
    p_phone_number,
    v_code,
    NOW() + INTERVAL '5 minutes'
  )
  RETURNING id INTO v_otp_id;

  RETURN json_build_object(
    'success', TRUE,
    'code', v_code,
    'otp_id', v_otp_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function برای بررسی OTP و ایجاد/ورود کاربر
CREATE OR REPLACE FUNCTION verify_otp_and_login(
  p_phone_number TEXT,
  p_code TEXT
)
RETURNS JSON AS $$
DECLARE
  v_otp RECORD;
  v_user_id UUID;
  v_profile RECORD;
  v_email TEXT;
BEGIN
  -- بررسی OTP
  SELECT * INTO v_otp FROM otp_codes
  WHERE phone_number = p_phone_number
    AND code = p_code
    AND verified = FALSE
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    -- افزایش تعداد تلاش‌های ناموفق
    UPDATE otp_codes
    SET attempts = attempts + 1
    WHERE phone_number = p_phone_number
      AND code = p_code
      AND verified = FALSE;

    RETURN json_build_object(
      'success', FALSE,
      'error', 'کد تایید نامعتبر یا منقضی شده است'
    );
  END IF;

  -- بررسی تعداد تلاش‌ها
  IF v_otp.attempts >= 5 THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'تعداد تلاش‌های مجاز تمام شده است'
    );
  END IF;

  -- علامت‌گذاری OTP به عنوان verified
  UPDATE otp_codes SET verified = TRUE, attempts = attempts + 1
  WHERE id = v_otp.id;

  -- بررسی وجود کاربر در profiles
  SELECT * INTO v_profile FROM profiles WHERE phone_number = p_phone_number;

  IF NOT FOUND THEN
    -- ایجاد email فیک برای auth
    v_email := p_phone_number || '@carpima.local';

    -- ایجاد کاربر در auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      phone,
      phone_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      v_email,
      crypt(gen_random_uuid()::text, gen_salt('bf')),
      NOW(),
      p_phone_number,
      NOW(),
      '{"provider":"phone","providers":["phone"]}'::jsonb,
      '{}'::jsonb,
      NOW(),
      NOW(),
      '',
      ''
    )
    RETURNING id INTO v_user_id;

    -- ایجاد پروفایل
    INSERT INTO profiles (id, phone_number, created_at, updated_at)
    VALUES (v_user_id, p_phone_number, NOW(), NOW());
  ELSE
    v_user_id := v_profile.id;
  END IF;

  RETURN json_build_object(
    'success', TRUE,
    'user_id', v_user_id,
    'phone_number', p_phone_number,
    'is_new_user', (v_profile IS NULL)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function برای دریافت اطلاعات پروفایل بر اساس user_id
CREATE OR REPLACE FUNCTION get_profile_by_user_id(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN row_to_json(v_profile);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
