// profilepage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProfilePage.css'; // <-- IMPORT THE NEW CSS

const ProfilePage = () => {
  const { user } = useAuth();
  const [mySkills, setMySkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('Beginner');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mySkillsRes, allSkillsRes] = await Promise.all([
          api.get('/users/profile/skills'),
          api.get('/skills')
        ]);
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
    fetchData();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setError('');
    // Prevent adding a skill that's already in the list
    if (mySkills.some(skill => skill.skill_id === parseInt(selectedSkill))) {
      setError('You already have this skill.');
      return;
    }
    try {
      await api.post('/users/profile/skills', {
        skill_id: selectedSkill,
        proficiency: selectedProficiency
      });
      const mySkillsRes = await api.get('/users/profile/skills');
      setMySkills(mySkillsRes.data);
    } catch (err)
 {
      setError(err.response?.data?.message || 'Failed to add skill.');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await api.delete(`/users/profile/skills/${skillId}`);
      setMySkills(mySkills.filter(skill => skill.skill_id !== skillId));
    } catch (err) {
      setError('Failed to remove skill.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <h1>My Profile</h1>
      {/* Use the .card class from globals.css and .profile-card for specific layout */}
      <div className="card profile-card">
        <h3>{user.f_name} {user.l_name}</h3>
        <div className="user-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>

        {/* <hr> is styled by globals.css */}
        <hr /> 

        <h3>My Skills</h3>
        {mySkills.length > 0 ? (
          <ul className="skills-list">
            {mySkills.map(skill => (
              <li key={skill.skill_id} className="skill-item">
                <span>{skill.skill_name} ({skill.proficiency})</span>
                {/* Use .btn utility classes */}
                <button 
                  onClick={() => handleRemoveSkill(skill.skill_id)} 
                  className="btn btn-destructive btn-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not added any skills yet.</p>
        )}

        <h3>Add a New Skill</h3>
        <form onSubmit={handleAddSkill} className="add-skill-form">
          <div className="form-row">
            <select 
              name="skill_id"
              value={selectedSkill} 
              onChange={e => setSelectedSkill(e.target.value)} 
              className="input" // <-- USE CLASS
            >
              {allSkills.map(skill => (
                <option key={skill.skill_id} value={skill.skill_id}>
                  {skill.skill_name}
                </option>
              ))}
            </select>
            <select 
              name="proficiency"
              value={selectedProficiency} 
              onChange={e => setSelectedProficiency(e.target.value)} 
              className="input" // <-- USE CLASS
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            Add Skill
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;