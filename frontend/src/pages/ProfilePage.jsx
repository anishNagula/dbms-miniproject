import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({ project_completed_count: 0, total_skills: 0 });
  const [mySkills, setMySkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('Beginner');
  const [selectedRating, setSelectedRating] = useState(2.5); // <-- NEW STATE for rating
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [detailsRes, mySkillsRes, allSkillsRes] = await Promise.all([
        api.get('/users/profile/details'),
        api.get('/users/profile/skills'),
        api.get('/skills')
      ]);
      setProfileData(detailsRes.data);
      setMySkills(mySkillsRes.data);
      setAllSkills(allSkillsRes.data);
      if (allSkillsRes.data.length > 0) {
        setSelectedSkill(allSkillsRes.data[0].skill_id);
      }
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users/profile/skills', {
        skill_id: selectedSkill,
        proficiency: selectedProficiency,
        rating: selectedRating // <-- PASS THE RATING
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill.');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await api.delete(`/users/profile/skills/${skillId}`);
      fetchData();
    } catch (err) {
      setError('Failed to remove skill.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <h2>My Profile</h2>
      <div className="profile-card">
        <h3>{user.f_name} {user.l_name}</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        
        <p><strong>Projects Completed:</strong> {profileData.project_completed_count}</p>
        <p><strong>Total Skills:</strong> {profileData.total_skills}</p>

        <hr className="profile-divider" />

        <h3>My Skills</h3>
        {mySkills.length > 0 ? (
          <ul className="skills-list">
            {mySkills.map(skill => (
              <li key={skill.skill_id} className="skill-item">
                
                {/* --- DISPLAY THE RATING --- */}
                <span>
                  {skill.skill_name} ({skill.proficiency}) - <strong>{skill.rating}/5</strong>
                </span>
                
                <button onClick={() => handleRemoveSkill(skill.skill_id)} className="remove-skill-btn">Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not added any skills yet.</p>
        )}

        <h3 className="add-skill-heading">Add / Update Skill</h3>
        <form onSubmit={handleAddSkill}>
          <div className="add-skill-form-group">
            <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)} className="skill-select">
              {allSkills.map(skill => (
                <option key={skill.skill_id} value={skill.skill_id}>
                  {skill.skill_name}
                </option>
              ))}
            </select>
            <select value={selectedProficiency} onChange={e => setSelectedProficiency(e.target.value)} className="proficiency-select">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>

            {/* --- RATING INPUT FIELD --- */}
            <input 
              type="number"
              value={selectedRating}
              onChange={e => setSelectedRating(parseFloat(e.target.value))}
              min="0"
              max="5"
              step="0.5"
              className="rating-input"
            />

          </div>
          <button type="submit" className="add-skill-btn">Add / Update Skill</button>
          {error && <p className="profile-error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;